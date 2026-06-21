from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
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

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )