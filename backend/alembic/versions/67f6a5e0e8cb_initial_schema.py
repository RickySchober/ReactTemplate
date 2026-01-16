"""initial schema

Revision ID: 67f6a5e0e8cb
Revises: 
Create Date: 2026-01-15 16:57:10.173359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67f6a5e0e8cb'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("tradeitem", recreate="always") as batch_op:
        batch_op.alter_column(
        "card_id",
        existing_type=sa.INTEGER(),
        type_=sa.CHAR(length=32),
    )
    with op.batch_alter_table("tradeitem", recreate="always") as batch_op:
        batch_op.alter_column(
        "trade_id",
        existing_type=sa.INTEGER(),
        type_=sa.CHAR(length=32),
    )

def downgrade() -> None:
    """Downgrade schema."""
    """Upgrade schema."""
    with op.batch_alter_table("tradeitem", recreate="always") as batch_op:
        batch_op.alter_column(
        "card_id",
        type=sa.INTEGER(),
        existing_type_=sa.CHAR(length=32),
    )
    with op.batch_alter_table("tradeitem", recreate="always") as batch_op:
        batch_op.alter_column(
        "trade_id",
        type=sa.INTEGER(),
        existing_type_=sa.CHAR(length=32),
    )