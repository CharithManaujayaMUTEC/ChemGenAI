from transformers import AutoTokenizer, AutoModel
import torch

MODEL_NAME = "seyonec/ChemBERTa-zinc-base-v1"

print("Loading ChemBERTa...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModel.from_pretrained(MODEL_NAME)

model.eval()

print("ChemBERTa loaded")


def get_embedding(smiles: str):

    inputs = tokenizer(
        smiles,
        return_tensors="pt",
        truncation=True,
        padding=True
    )

    with torch.no_grad():

        outputs = model(**inputs)

    embedding = outputs.last_hidden_state.mean(dim=1)

    return embedding.squeeze()


def get_embedding_score(smiles: str):

    embedding = get_embedding(smiles)

    score = embedding.norm().item()

    return round(score, 3)