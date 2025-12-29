from __future__ import annotations

from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.component import Component

class Subsystem(Base):
    __tablename__ = "subsystems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    
    components: Mapped[List["Component"]] = relationship(back_populates="subsystem")


