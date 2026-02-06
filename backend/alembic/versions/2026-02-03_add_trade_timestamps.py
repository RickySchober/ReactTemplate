"""add trade timestamps

Revision ID: fe3ec0d88b59
Revises: 
Create Date: 2026-02-03 13:45:25.819375

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'fe3ec0d88b59'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # 1. Add columns WITHOUT defaults (SQLite requirement)
    op.add_column(
        "tradeoffer",
        sa.Column("last_updated", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "tradeoffer",
        sa.Column("last_viewed", sa.DateTime(timezone=True), nullable=True),
    )

    # 2. Backfill existing rows
    op.execute("""
        UPDATE tradeoffer
        SET
            last_updated = CURRENT_TIMESTAMP,
            last_viewed = CURRENT_TIMESTAMP
    """)

    # 3. Make columns non-nullable
    with op.batch_alter_table("tradeoffer") as batch:
        batch.alter_column("last_updated", nullable=False)
        batch.alter_column("last_viewed", nullable=False)


def downgrade():
    op.drop_column("tradeoffer", "last_viewed")
    op.drop_column("tradeoffer", "last_updated")