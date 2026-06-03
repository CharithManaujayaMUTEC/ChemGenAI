from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.evaluation.metrics import is_valid_smiles
from src.api.model_service import generate_smiles

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


@app.post(
    "/generate",
    response_model=GenerateResponse
)
def generate(request: GenerateRequest):

    smiles = generate_smiles()

    return {
        "prompt": request.prompt,
        "generated_smiles": smiles,
        "valid": is_valid_smiles(smiles)
    }


@app.get("/ping")
def ping():
    return {
        "message": "pong"
    }