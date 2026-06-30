import json
import torch

from src.models.lstm_vae import LSTMVAE
from src.data.preprocess import SmilesTokenizer

from src.utils.prompt_parser import parse_prompt

from src.evaluation.metrics import is_valid_smiles
from src.evaluation.properties import calculate_properties
from src.evaluation.lipinski import evaluate_lipinski
from src.evaluation.chemberta import get_embedding_score


# ==========================================
# DEVICE
# ==========================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Loading tokenizer...")

# ==========================================
# TOKENIZER
# ==========================================

with open("models/vocab.json", "r") as f:
    vocab = json.load(f)

tokenizer = SmilesTokenizer()

tokenizer.vocab = vocab

tokenizer.char_to_idx = {
    ch: idx for idx, ch in enumerate(vocab)
}

tokenizer.idx_to_char = {
    idx: ch for idx, ch in enumerate(vocab)
}

print("Tokenizer loaded successfully")

# ==========================================
# MODEL
# ==========================================

model = LSTMVAE(
    vocab_size=len(tokenizer.vocab),
    embedding_dim=128,
    hidden_dim=256,
    latent_dim=128
).to(device)

model.load_state_dict(
    torch.load(
        "models/lstm_vae.pt",
        map_location=device
    )
)

model.eval()

print("Model loaded successfully")

# ==========================================
# DEFAULTS
# ==========================================

DEFAULT_MAX_LEN = 120


# ==========================================
# SINGLE MOLECULE GENERATION
# ==========================================

def generate_single_smiles(
    temperature,
    max_length
):

    with torch.no_grad():

        z = torch.randn(
            1,
            model.latent_dim
        ).to(device)

        hidden = torch.tanh(
            model.fc_latent_to_hidden(z)
        ).unsqueeze(0)

        cell = torch.zeros_like(hidden)

        current_token = torch.tensor(
            [[tokenizer.char_to_idx["<start>"]]],
            device=device
        )

        generated_tokens = []

        for _ in range(max_length):

            embedded = model.embedding(current_token)

            output, (hidden, cell) = model.decoder_lstm(
                embedded,
                (hidden, cell)
            )

            logits = model.output_fc(output)

            probs = torch.softmax(
                logits.squeeze(1) / temperature,
                dim=-1
            )

            next_token = torch.multinomial(
                probs,
                1
            )

            token = next_token.item()

            if token == tokenizer.char_to_idx["<end>"]:
                break

            generated_tokens.append(token)

            current_token = next_token

        return tokenizer.decode(generated_tokens)


# ==========================================
# RANKING
# ==========================================

def calculate_score(
    valid,
    drug_like,
    chemberta_score
):

    score = 0

    if valid:
        score += 50

    if drug_like:
        score += 30

    score += min(
        chemberta_score,
        20
    )

    return round(score, 2)


# ==========================================
# MAIN GENERATOR
# ==========================================

def generate_smiles(
    prompt="Generate a molecule"
):

    settings = parse_prompt(prompt)

    temperature = settings["temperature"]

    max_length = settings["max_length"]

    num_candidates = settings["num_candidates"]

    molecules = []

    seen = set()

    while len(molecules) < num_candidates:

        smiles = generate_single_smiles(
            temperature,
            max_length
        )

        if smiles in seen:
            continue

        seen.add(smiles)

        valid = is_valid_smiles(smiles)

        if valid:

            properties = calculate_properties(smiles)

            lipinski = evaluate_lipinski(properties)

            chemberta = get_embedding_score(smiles)

            score = calculate_score(
                valid,
                lipinski["drug_like"],
                chemberta
            )

        else:

            properties = None

            lipinski = {
                "drug_like": False,
                "violations": [],
                "violation_count": 4
            }

            chemberta = 0

            score = 0

        molecules.append({

            "smiles": smiles,

            "valid": valid,

            "properties": properties,

            "lipinski": lipinski,

            "chemberta_score": chemberta,

            "score": score

        })

    molecules.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    for rank, molecule in enumerate(
        molecules,
        start=1
    ):

        molecule["rank"] = rank

    valid_count = sum(
        1
        for m in molecules
        if m["valid"]
    )

    drug_like_count = sum(
        1
        for m in molecules
        if m["lipinski"]["drug_like"]
    )

    average_score = round(

        sum(
            m["score"]
            for m in molecules
        ) / len(molecules),

        2

    )

    return {

        "prompt": prompt,

        "interpreted_prompt": settings,

        "summary": {

            "generated": len(molecules),

            "valid": valid_count,

            "drug_like": drug_like_count,

            "average_score": average_score

        },

        "results": molecules

    }

# ==========================================
# TEST
# ==========================================

if __name__ == "__main__":

    result = generate_smiles(
        "Generate a highly diverse aromatic molecule"
    )

    print(result)