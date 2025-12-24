"""create components table

Revision ID: 0001
Revises: None
Create Date: 2025-12-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "components",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=200), nullable=False, unique=True),
        sa.Column("mass_kg", sa.Numeric(12, 6), nullable=False, server_default="0"),
        sa.Column("cost_usd", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("components.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_components_parent_id", "components", ["parent_id"])

def downgrade() -> None:
    op.drop_index("ix_components_parent_id", table_name="components")
    op.drop_table("components")
