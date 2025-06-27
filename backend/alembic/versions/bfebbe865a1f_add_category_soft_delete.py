"""add category soft delete

Revision ID: bfebbe865a1f
Revises: 73217a17dd06
Create Date: 2025-06-27 23:16:01.021929

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bfebbe865a1f'
down_revision: Union[str, None] = '73217a17dd06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('categories', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'))
    pass


def downgrade() -> None:
    op.drop_column('categories', 'is_deleted') 
    pass
