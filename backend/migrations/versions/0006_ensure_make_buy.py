"""ensure make_buy field exists

Revision ID: 0006
Revises: 0005
Create Date: 2026-01-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector


revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('components')]
    
    if 'make_buy' not in columns:
        op.add_column("components", sa.Column("make_buy", sa.String(length=1), nullable=True))


def downgrade() -> None:
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('components')]
    
    if 'make_buy' in columns:
        op.drop_column("components", "make_buy")

