"""create history tracking

Revision ID: 6c1fbed24028
Revises: 052dca56029e
Create Date: 2024-01-25 16:04:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '6c1fbed24028'
down_revision: Union[str, None] = '052dca56029e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create ticket_history table
    op.create_table('ticket_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action_type', sa.String(length=20), nullable=False),
        sa.Column('old_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('from_category_name', sa.String(length=100), nullable=True),
        sa.Column('to_category_name', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['ticket_id'], ['tickets.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for better query performance
    op.create_index('idx_ticket_history_ticket_id', 'ticket_history', ['ticket_id'])
    op.create_index('idx_ticket_history_created_at', 'ticket_history', ['created_at'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes
    op.drop_index('idx_ticket_history_created_at', table_name='ticket_history')
    op.drop_index('idx_ticket_history_ticket_id', table_name='ticket_history')
    
    # Drop table
    op.drop_table('ticket_history')
