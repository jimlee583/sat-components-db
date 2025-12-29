"""add subsystems

Revision ID: 0002
Revises: 0001
Create Date: 2025-12-28
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create subsystems table
    op.create_table(
        "subsystems",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=200), nullable=False, unique=True),
    )
    
    # Add subsystem_id column to components
    op.add_column("components", sa.Column("subsystem_id", sa.Integer(), nullable=True))
    
    # Add foreign key constraint
    op.create_foreign_key(
        "fk_components_subsystem_id_subsystems",
        "components", "subsystems",
        ["subsystem_id"], ["id"],
        ondelete="SET NULL"
    )
    
    # Add index
    op.create_index("ix_components_subsystem_id", "components", ["subsystem_id"])

def downgrade() -> None:
    op.drop_index("ix_components_subsystem_id", table_name="components")
    op.drop_constraint("fk_components_subsystem_id_subsystems", "components", type_="foreignkey")
    op.drop_column("components", "subsystem_id")
    op.drop_table("subsystems")


