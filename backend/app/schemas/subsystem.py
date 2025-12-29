from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field

class SubsystemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)

class SubsystemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)

class SubsystemOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


