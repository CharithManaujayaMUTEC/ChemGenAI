import json
import torch

from src.models.lstm_vae import LSTMVAE
from src.data.preprocess import SmilesTokenizer

# =========================
# DEVICE
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Loading tokenizer...")

# =========================
# LOAD TOKENIZER
# =========================

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

# Fixed maximum sequence length
max_len = 120

print("Tokenizer loaded successfully")

# =========================
# LOAD MODEL
# =========================

print("Loading model...")

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

# =========================
# GENERATE MOLECULE
# =========================

def generate_smiles():

    with torch.no_grad():

        # Random latent vector
        z = torch.randn(1, 128).to(device)

        # NOTE:
        # This is currently a placeholder generation.
        # We will improve this later.

        return "CCO"