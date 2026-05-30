from fastapi import FastAPI

app = FastAPI(
    title="ChemGenAI API",
    version="1.0.0"
)


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
    return {
        "generated_smiles": "CCO"
    }