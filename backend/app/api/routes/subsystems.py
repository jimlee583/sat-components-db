from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.api.deps import get_db
from app.models.subsystem import Subsystem
from app.schemas.subsystem import SubsystemCreate, SubsystemOut

router = APIRouter()

@router.post("", response_model=SubsystemOut, status_code=201)
def create_subsystem(payload: SubsystemCreate, db: Session = Depends(get_db)):
    existing = db.execute(select(Subsystem).where(Subsystem.name == payload.name)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Subsystem name already exists")
    
    sub = Subsystem(name=payload.name)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("", response_model=List[SubsystemOut])
def list_subsystems(db: Session = Depends(get_db)):
    return list(db.execute(select(Subsystem).order_by(Subsystem.name)).scalars().all())

@router.delete("/{subsystem_id}", status_code=204)
def delete_subsystem(subsystem_id: int, db: Session = Depends(get_db)):
    sub = db.get(Subsystem, subsystem_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subsystem not found")
    
    db.delete(sub)
    db.commit()


