"""add user profile picture

Revision ID: 73217a17dd06
Revises: 63b00228b1f1
Create Date: 2025-06-24 19:59:15.164461

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73217a17dd06'
down_revision: Union[str, None] = '63b00228b1f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('users', sa.Column('profile_picture', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('users', 'profile_picture')
