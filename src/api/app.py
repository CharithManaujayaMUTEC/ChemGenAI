from datetime import datetime

from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.api.model_service import generate_smiles

from src.database.database import SessionLocal, engine
from src.database.models import Base, Molecule

# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)

# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="ChemGenAI API",
    version="2.1.0"
)

print("ChemGenAI FastAPI Started")

# ==========================================
# REQUEST MODEL
# ==========================================

class GenerateRequest(BaseModel):
    prompt: str = Field(
        default="Generate a molecule",
        description="Natural language prompt"
    )

# ==========================================
# ROOT
# ==========================================

@app.get("/")
def home():
    return {
        "message": "ChemGenAI API Running",
        "version": "2.1.0"
    }

# ==========================================
# HEALTH
# ==========================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

# ==========================================
# PING
# ==========================================

@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }

# ==========================================
# GENERATE MOLECULES
# ==========================================

@app.post("/generate")
def generate(request: GenerateRequest):

    result = generate_smiles(request.prompt)

    db = SessionLocal()

    try:

        for molecule in result["results"]:

            properties = molecule["properties"]

            db.add(

                Molecule(

                    smiles=molecule["smiles"],

                    valid=molecule["valid"],

                    prompt=request.prompt,

                    chemberta_score=molecule["chemberta_score"],

                    score=molecule["score"],

                    drug_like=molecule["lipinski"]["drug_like"],

                    molecular_weight=(
                        properties["molecular_weight"]
                        if properties else None
                    ),

                    logp=(
                        properties["logP"]
                        if properties else None
                    ),

                    tpsa=(
                        properties["tpsa"]
                        if properties else None
                    ),

                    h_bond_donors=(
                        properties["h_bond_donors"]
                        if properties else None
                    ),

                    h_bond_acceptors=(
                        properties["h_bond_acceptors"]
                        if properties else None
                    ),

                    rotatable_bonds=(
                        properties["rotatable_bonds"]
                        if properties else None
                    ),

                    ring_count=(
                        properties["ring_count"]
                        if properties else None
                    ),

                    heavy_atoms=(
                        properties["heavy_atoms"]
                        if properties else None
                    )

                )

            )

        db.commit()

    finally:

        db.close()

    result["generated_at"] = datetime.utcnow().isoformat()

    return result

# ==========================================
# GENERATION HISTORY
# ==========================================

@app.get("/history")
def history():

    db = SessionLocal()

    try:

        molecules = (

            db.query(Molecule)

            .order_by(Molecule.id.desc())

            .limit(100)

            .all()

        )

        result = []

        for molecule in molecules:

            result.append({

                "id": molecule.id,

                "smiles": molecule.smiles,

                "valid": molecule.valid,

                "prompt": molecule.prompt,

                "chemberta_score": molecule.chemberta_score,

                "score": molecule.score,

                "drug_like": molecule.drug_like,

                "molecular_weight": molecule.molecular_weight,

                "logp": molecule.logp,

                "tpsa": molecule.tpsa,

                "h_bond_donors": molecule.h_bond_donors,

                "h_bond_acceptors": molecule.h_bond_acceptors,

                "rotatable_bonds": molecule.rotatable_bonds,

                "ring_count": molecule.ring_count,

                "heavy_atoms": molecule.heavy_atoms,

                "created_at": molecule.created_at

            })

        return result

    finally:

        db.close()