"""add multiple user assignment

Revision ID: 63b00228b1f1
Revises: 6c1fbed24028
Create Date: 2025-06-24 18:02:36.869874

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '63b00228b1f1'
down_revision: Union[str, None] = '6c1fbed24028'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('ticket_users',
        sa.Column('ticket_id', UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('ticket_id', 'user_id')
    )
    
    op.create_index('ix_ticket_users_ticket_id', 'ticket_users', ['ticket_id'])
    op.create_index('ix_ticket_users_user_id', 'ticket_users', ['user_id'])
    
    op.execute("""
        INSERT INTO ticket_users (ticket_id, user_id, assigned_at)
        SELECT id, user_id, created_at
        FROM tickets
        WHERE user_id IS NOT NULL
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_ticket_users_user_id', 'ticket_users')
    op.drop_index('ix_ticket_users_ticket_id', 'ticket_users')
    
    op.drop_table('ticket_users')
