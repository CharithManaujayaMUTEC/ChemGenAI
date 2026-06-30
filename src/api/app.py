"""
ChemGenAI API
-------------
FastAPI service exposing endpoints to generate molecules (SMILES strings)
from a trained generative model, validate them with RDKit, and persist
results to a database for later retrieval via /history.
"""

from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.evaluation.metrics import is_valid_smiles
from src.api.model_service import generate_smiles

from src.database.database import engine
from src.database.models import Base

# Create all tables on startup if they don't already exist.
# Safe to call repeatedly — SQLAlchemy no-ops on existing tables.
Base.metadata.create_all(bind=engine)

from src.database.database import SessionLocal
from src.database.models import Molecule

app = FastAPI(
    title="ChemGenAI API",
    version="1.0.0"
)

print("ChemGenAI FastAPI started")


class GenerateRequest(BaseModel):
    """Request body for /generate. `prompt` is currently unused by the
    model itself (generation is unconditional) but is stored alongside
    each result so it can support conditional generation later."""
    prompt: str = Field(
        default="Generate a molecule",
        description="User prompt for future conditional molecule generation"
    )


class GenerateResponse(BaseModel):
    prompt: str
    generated_smiles: str
    valid: bool


@app.get("/")
def home():
    """Basic liveness/info endpoint."""
    return {
        "message": "ChemGenAI API Running"
    }


@app.get("/health")
def health():
    """Health check endpoint for uptime monitoring / orchestration probes."""
    return {
        "status": "healthy"
    }


@app.post("/generate")
def generate(request: GenerateRequest):
    """
    Generate a new molecule, check its chemical validity, and store
    the result in the database.
    """
    smiles = generate_smiles()

    valid = is_valid_smiles(smiles)

    # NOTE: opens/closes a session per request rather than using a
    # dependency-injected session — fine for low traffic, but consider
    # FastAPI's Depends() pattern if this needs to scale.
    db = SessionLocal()

    molecule = Molecule(
        smiles=smiles,
        valid=valid,
        prompt=request.prompt
    )

    db.add(molecule)
    db.commit()
    db.close()

    return {
        "prompt": request.prompt,
        "generated_smiles": smiles,
        "valid": valid
    }


@app.get("/ping")
def ping():
    """Simple connectivity check, separate from /health for load balancers
    that expect a plain pong response."""
    return {
        "message": "pong"
    }


@app.get("/history")
def history():
    """Return the 50 most recently generated molecules, newest first."""
    db = SessionLocal()

    molecules = (
        db.query(Molecule)
        .order_by(Molecule.id.desc())
        .limit(50)
        .all()
    )

    result = []

    for molecule in molecules:
        result.append({
            "id": molecule.id,
            "smiles": molecule.smiles,
            "valid": molecule.valid,
            "prompt": molecule.prompt,
            "created_at": molecule.created_at
        })

    db.close()

    return result