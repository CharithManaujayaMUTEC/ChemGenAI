from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Float
)

from sqlalchemy.orm import declarative_base

from datetime import datetime

Base = declarative_base()


class Molecule(Base):

    __tablename__ = "molecules"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    smiles = Column(
        String,
        nullable=False
    )

    valid = Column(
        Boolean,
        nullable=False
    )

    prompt = Column(
        String
    )

    chemberta_score = Column(
        Float,
        nullable=True
    )

    score = Column(
        Float,
        nullable=True
    )

    drug_like = Column(
        Boolean,
        nullable=True
    )

    molecular_weight = Column(
        Float,
        nullable=True
    )

    logp = Column(
        Float,
        nullable=True
    )

    tpsa = Column(
        Float,
        nullable=True
    )

    h_bond_donors = Column(
        Integer,
        nullable=True
    )

    h_bond_acceptors = Column(
        Integer,
        nullable=True
    )

    rotatable_bonds = Column(
        Integer,
        nullable=True
    )

    ring_count = Column(
        Integer,
        nullable=True
    )

    heavy_atoms = Column(
        Integer,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )