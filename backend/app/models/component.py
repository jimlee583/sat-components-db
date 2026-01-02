from __future__ import annotations

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.subsystem import Subsystem

class Component(Base):
    __tablename__ = "components"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    part_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    wbs: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    mass_kg: Mapped[float] = mapped_column(Numeric(12, 6), nullable=False, default=0)
    cost_usd: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("components.id", ondelete="SET NULL"),
        nullable=True,
    )

    subsystem_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("subsystems.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Self-referential relationship
    parent: Mapped[Optional["Component"]] = relationship(
        back_populates="children",
        remote_side="Component.id",
    )

    subsystem: Mapped[Optional["Subsystem"]] = relationship(back_populates="components")

    children: Mapped[List["Component"]] = relationship(
        back_populates="parent",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
