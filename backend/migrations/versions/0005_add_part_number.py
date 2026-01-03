"""add part_number field

Revision ID: 0005
Revises: 0004
Create Date: 2026-01-02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Check if column exists before adding
    conn = op.get_bind()
    inspector = Inspector.from_engine(conn)
    columns = [col['name'] for col in inspector.get_columns('components')]
    
    if 'part_number' not in columns:
        op.add_column("components", sa.Column("part_number", sa.String(length=50), nullable=True))

def downgrade() -> None:
    op.drop_column("components", "part_number")

