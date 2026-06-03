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

        z = torch.randn(
            1,
            model.latent_dim
        ).to(device)

        hidden = torch.tanh(
            model.fc_latent_to_hidden(z)
        ).unsqueeze(0)

        cell = torch.zeros_like(hidden)

        start_token = tokenizer.char_to_idx["<start>"]

        current_token = torch.tensor(
            [[start_token]],
            device=device
        )

        generated_tokens = []

        for _ in range(max_len):

            embedded = model.embedding(current_token)

            output, (hidden, cell) = model.decoder_lstm(
                embedded,
                (hidden, cell)
            )

            logits = model.output_fc(output)

            temperature = 0.8

            probs = torch.softmax(
                logits.squeeze(1) / temperature,
                dim=-1
            )

            next_token = torch.multinomial(
                probs,
                num_samples=1
            )

            token_id = next_token.item()

            if token_id == tokenizer.char_to_idx["<end>"]:
                break

            generated_tokens.append(token_id)

            current_token = next_token

        smiles = tokenizer.decode(
            generated_tokens
        )

        return smiles

if __name__ == "__main__":

    print("START TEST")

    molecule = generate_smiles()

    print("Generated molecule:")
    print(repr(molecule))

    print("END TEST")