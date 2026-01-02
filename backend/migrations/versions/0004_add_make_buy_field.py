"""add make_buy field

Revision ID: 0004
Revises: 0003
Create Date: 2026-01-02
"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("components", sa.Column("make_buy", sa.String(length=1), nullable=True))

def downgrade() -> None:
    op.drop_column("components", "make_buy")

