from __future__ import annotations
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.subsystem import SubsystemOut

class ComponentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    wbs: Optional[str] = Field(default=None, max_length=50)
    mass_kg: float = Field(ge=0)
    cost_usd: float = Field(ge=0)
    quantity: int = Field(ge=1)
    parent_id: Optional[int] = None
    subsystem_id: Optional[int] = None

class ComponentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    wbs: Optional[str] = Field(default=None, max_length=50)
    mass_kg: Optional[float] = Field(default=None, ge=0)
    cost_usd: Optional[float] = Field(default=None, ge=0)
    quantity: Optional[int] = Field(default=None, ge=1)
    parent_id: Optional[int] = None
    subsystem_id: Optional[int] = None

class ComponentOut(BaseModel):
    id: int
    name: str
    wbs: Optional[str]
    mass_kg: float
    cost_usd: float
    quantity: int
    parent_id: Optional[int]
    subsystem_id: Optional[int]
    subsystem: Optional[SubsystemOut] = None

    class Config:
        from_attributes = True

class ComponentTree(ComponentOut):
    children: List["ComponentTree"] = []

ComponentTree.model_rebuild()
