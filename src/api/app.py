from fastapi import FastAPI
from pydantic import BaseModel

from src.api.model_service import generate_smiles

app = FastAPI(
    title="ChemGenAI API",
    version="1.0.0"
)

print("ChemGenAI FastAPI started")

class GenerateRequest(BaseModel):
    prompt: str


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


@app.post("/generate")
def generate(request: GenerateRequest):

    smiles = generate_smiles()

    return {
        "prompt": request.prompt,
        "generated_smiles": smiles
    }

@app.get("/ping")
def ping():
    return {"message": "pong"}