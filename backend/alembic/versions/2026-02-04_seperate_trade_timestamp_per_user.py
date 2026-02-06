"""seperate trade timestamp per user

Revision ID: d887c062555b
Revises: fe3ec0d88b59
Create Date: 2026-02-04 15:24:28.901764

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'd887c062555b'
down_revision: Union[str, Sequence[str], None] = 'fe3ec0d88b59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # SQLite requires batch mode for ALTER TABLE
    with op.batch_alter_table("tradeoffer") as batch_op:
        # Rename last_viewed -> a_viewed
        batch_op.alter_column(
            "last_viewed",
            new_column_name="a_viewed",
            existing_type=sa.DateTime(timezone=True),
        )

        # Add b_viewed column
        batch_op.add_column(
            sa.Column(
                "b_viewed",
                sa.DateTime(timezone=True),
                nullable=True,
                server_default=sa.text("CURRENT_TIMESTAMP"),
            )
        )
        batch_op.drop_column("quantity")

    # Backfill b_viewed using a_viewed (so existing rows are consistent)
    op.execute(
        "UPDATE tradeoffer SET b_viewed = a_viewed WHERE b_viewed IS NULL"
    )


def downgrade() -> None:
    with op.batch_alter_table("tradeoffer") as batch_op:
        # Drop b_viewed
        batch_op.drop_column("b_viewed")

        # Rename a_viewed back to last_viewed
        batch_op.alter_column(
            "a_viewed",
            new_column_name="last_viewed",
            existing_type=sa.DateTime(timezone=True),
        )
        # Re-add quantity column with default value
        batch_op.add_column(
            sa.Column(
                "quantity",
                sa.Integer(),
                nullable=False,
                server_default="1",
            )
        )
