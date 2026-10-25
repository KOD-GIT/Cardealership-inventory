"""store money as 64-bit integers

A 32-bit price_cents tops out at 21,474,836.47 currency units, which a car priced in crores of rupees
(for example 4,10,00,000) overflows. Widen both money columns to BIGINT.

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-25 21:00:00
"""
import sqlalchemy as sa

from alembic import op

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('vehicles', 'price_cents', existing_type=sa.Integer(), type_=sa.BigInteger(), existing_nullable=False)
    op.alter_column('purchases', 'unit_price_cents', existing_type=sa.Integer(), type_=sa.BigInteger(), existing_nullable=False)


def downgrade() -> None:
    # Narrowing fails (on purpose) if any stored price no longer fits in 32 bits.
    op.alter_column('purchases', 'unit_price_cents', existing_type=sa.BigInteger(), type_=sa.Integer(), existing_nullable=False)
    op.alter_column('vehicles', 'price_cents', existing_type=sa.BigInteger(), type_=sa.Integer(), existing_nullable=False)
