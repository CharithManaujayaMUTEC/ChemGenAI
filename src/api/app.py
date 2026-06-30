from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.evaluation.metrics import is_valid_smiles
from src.api.model_service import generate_smiles

from src.database.database import engine
from src.database.models import Base

Base.metadata.create_all(bind=engine)

from src.database.database import SessionLocal
from src.database.models import Molecule

from src.evaluation.chemberta import get_embedding_score

app = FastAPI(
    title="ChemGenAI API",
    version="1.0.0"
)

print("ChemGenAI FastAPI started")


class GenerateRequest(BaseModel):
    prompt: str = Field(
        default="Generate a molecule",
        description="User prompt for future conditional molecule generation"
    )


class GenerateResponse(BaseModel):
    prompt: str
    generated_smiles: str
    valid: bool
    chemberta_embedding_score: float


@app.get("/")
def home():
    return {
        "message": "ChemGenAI API Running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/generate",response_model=GenerateResponse)
def generate(request: GenerateRequest):

    smiles = generate_smiles(request.prompt)

    valid = is_valid_smiles(smiles)

    chemberta_embedding_score = get_embedding_score(smiles)

    db = SessionLocal()

    molecule = Molecule(
        smiles=smiles,
        valid=valid,
        prompt=request.prompt,
        chemberta_embedding_score=chemberta_embedding_score
    )

    db.add(molecule)

    db.commit()

    db.close()

    return {
        "prompt": request.prompt,
        "generated_smiles": smiles,
        "valid": valid,
        "chemberta_embedding_score": chemberta_embedding_score
    }

@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }

@app.get("/history")
def history():

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
            "chemberta_embedding_score": molecule.chemberta_embedding_score,
            "created_at": molecule.created_at
        })

    db.close()

    return result