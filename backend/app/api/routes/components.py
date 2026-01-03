from __future__ import annotations

from typing import Optional, List, Dict, Any
from io import BytesIO
import openpyxl
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from app.api.deps import get_db
from app.models.component import Component
from app.models.subsystem import Subsystem
from app.schemas.component import ComponentCreate, ComponentOut, ComponentUpdate, ComponentTree

router = APIRouter()

@router.post("", response_model=ComponentOut, status_code=201)
def create_component(payload: ComponentCreate, db: Session = Depends(get_db)) -> Component:
    # Optional parent existence check
    if payload.parent_id is not None:
        parent = db.get(Component, payload.parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="parent_id not found")

    if payload.subsystem_id is not None:
        subsystem = db.get(Subsystem, payload.subsystem_id)
        if subsystem is None:
            raise HTTPException(status_code=404, detail="subsystem_id not found")

    existing = db.execute(select(Component).where(Component.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Component name already exists")

    comp = Component(
        name=payload.name,
        part_number=payload.part_number,
        wbs=payload.wbs,
        make_buy=payload.make_buy,
        mass_kg=payload.mass_kg,
        cost_usd=payload.cost_usd,
        quantity=payload.quantity,
        parent_id=payload.parent_id,
        subsystem_id=payload.subsystem_id,
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

@router.get("", response_model=List[ComponentOut])
def list_components(
    roots_only: bool = Query(False, description="If true, only return components with no parent"),
    db: Session = Depends(get_db),
) -> List[Component]:
    stmt = select(Component).options(joinedload(Component.subsystem))
    if roots_only:
        stmt = stmt.where(Component.parent_id.is_(None))
    return list(db.execute(stmt.order_by(Component.id)).scalars().all())

@router.get("/export/excel")
def export_components_excel(db: Session = Depends(get_db)):
    # Fetch all components
    components = db.execute(select(Component).options(joinedload(Component.subsystem)).order_by(Component.id)).scalars().all()
    
    # Create workbook and sheet
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Components"
    
    # Headers
    headers = ["ID", "Name", "Part Number", "WBS", "Make/Buy", "Mass (kg)", "Cost ($)", "Quantity", "Parent ID", "Subsystem"]
    ws.append(headers)
    
    # Style headers
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)
        
    # Data
    for comp in components:
        ws.append([
            comp.id,
            comp.name,
            comp.part_number,
            comp.wbs,
            comp.make_buy,
            comp.mass_kg,
            comp.cost_usd,
            comp.quantity,
            comp.parent_id,
            comp.subsystem.name if comp.subsystem else None
        ])
        
    # Auto-width columns
    for column_cells in ws.columns:
        length = max(len(str(cell.value)) if cell.value is not None else 0 for cell in column_cells)
        ws.column_dimensions[column_cells[0].column_letter].width = length + 2
        
    # Save to buffer
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="components.xlsx"'
    }
    
    return StreamingResponse(buffer, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers=headers)

@router.get("/{component_id}", response_model=ComponentOut)
def get_component(component_id: int, db: Session = Depends(get_db)) -> Component:
    comp = db.execute(
        select(Component)
        .options(joinedload(Component.subsystem))
        .where(Component.id == component_id)
    ).scalar_one_or_none()
    if comp is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return comp

@router.patch("/{component_id}", response_model=ComponentOut)
def update_component(component_id: int, payload: ComponentUpdate, db: Session = Depends(get_db)) -> Component:
    comp = db.get(Component, component_id)
    if comp is None:
        raise HTTPException(status_code=404, detail="Component not found")

    if payload.parent_id is not None:
        if payload.parent_id == component_id:
            raise HTTPException(status_code=400, detail="Component cannot be its own parent")
        parent = db.get(Component, payload.parent_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="parent_id not found")

    if payload.subsystem_id is not None:
        subsystem = db.get(Subsystem, payload.subsystem_id)
        if subsystem is None:
            raise HTTPException(status_code=404, detail="subsystem_id not found")

    # Apply partial updates
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(comp, k, v)

    db.commit()
    db.refresh(comp)
    return comp

@router.delete("/{component_id}", status_code=204)
def delete_component(component_id: int, db: Session = Depends(get_db)):
    comp = db.get(Component, component_id)
    if comp is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(comp)
    db.commit()
    return Response(status_code=204)

def _build_tree(all_components: List[Component]) -> List[ComponentTree]:
    # Build map id -> node dict
    nodes: Dict[int, ComponentTree] = {}
    for c in all_components:
        nodes[c.id] = ComponentTree.model_validate(c, from_attributes=True)

    # Attach children
    roots: List[ComponentTree] = []
    for c in all_components:
        node = nodes[c.id]
        if c.parent_id is None:
            roots.append(node)
        else:
            parent = nodes.get(c.parent_id)
            if parent:
                parent.children.append(node)

    return roots

@router.get("/{component_id}/tree", response_model=ComponentTree)
def get_subtree(component_id: int, db: Session = Depends(get_db)) -> ComponentTree:
    # For simplicity (learning), load all and build in memory.
    all_components = list(db.execute(select(Component)).scalars().all())
    node_map: Dict[int, ComponentTree] = {}
    for c in all_components:
        node_map[c.id] = ComponentTree.model_validate(c, from_attributes=True)

    # Attach children
    for c in all_components:
        if c.parent_id is not None and c.parent_id in node_map:
            node_map[c.parent_id].children.append(node_map[c.id])

    if component_id not in node_map:
        raise HTTPException(status_code=404, detail="Component not found")

    return node_map[component_id]

@router.post("/seed", response_model=List[ComponentOut])
def seed_example(db: Session = Depends(get_db)) -> List[Component]:
    """
    Creates a simple hierarchy:
      Battery Assembly
        - Li-Ion Battery
            - Li-Ion Cell
        - Battery Bracket

    Plus a Solar Array with panels as children.
    """
    # Avoid double-seeding: if exists, return current list
    existing = db.execute(select(Component).limit(1)).scalar_one_or_none()
    if existing:
        return list(db.execute(select(Component).options(joinedload(Component.subsystem)).order_by(Component.id)).scalars().all())

    # Create subsystems
    eps = Subsystem(name="EPS")
    struc = Subsystem(name="Structures")
    db.add_all([eps, struc])
    db.flush()

    battery_assembly = Component(name="Battery Assembly", mass_kg=12.5, cost_usd=25000, quantity=1, parent_id=None, subsystem_id=eps.id)
    db.add(battery_assembly)
    db.flush()

    li_ion_battery = Component(name="Li-Ion Battery", mass_kg=10.0, cost_usd=18000, quantity=1, parent_id=battery_assembly.id, subsystem_id=eps.id)
    battery_bracket = Component(name="Battery Bracket", mass_kg=2.5, cost_usd=7000, quantity=1, parent_id=battery_assembly.id, subsystem_id=struc.id)
    db.add_all([li_ion_battery, battery_bracket])
    db.flush()

    li_ion_cell = Component(name="Li-Ion Cell", mass_kg=0.045, cost_usd=35, quantity=200, parent_id=li_ion_battery.id, subsystem_id=eps.id)
    db.add(li_ion_cell)

    solar_array = Component(name="Solar Array", mass_kg=25.0, cost_usd=90000, quantity=1, parent_id=None, subsystem_id=eps.id)
    db.add(solar_array)
    db.flush()

    panel = Component(name="Solar Panel", mass_kg=2.0, cost_usd=5000, quantity=8, parent_id=solar_array.id, subsystem_id=eps.id)
    harness = Component(name="Array Harness", mass_kg=1.2, cost_usd=1500, quantity=1, parent_id=solar_array.id, subsystem_id=eps.id)
    db.add_all([panel, harness])

    db.commit()
    return list(db.execute(select(Component).options(joinedload(Component.subsystem)).order_by(Component.id)).scalars().all())
