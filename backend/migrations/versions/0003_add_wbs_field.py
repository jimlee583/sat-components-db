"""add wbs field

Revision ID: 0003
Revises: 0002
Create Date: 2025-12-31
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("components", sa.Column("wbs", sa.String(length=50), nullable=True))

def downgrade() -> None:
    op.drop_column("components", "wbs")

