import torch

from src.models.lstm_vae import LSTMVAE
from src.data.load_data import load_zinc_subset
from src.data.preprocess import SmilesTokenizer

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Loading tokenizer...")

smiles_list = load_zinc_subset(5000)

tokenizer = SmilesTokenizer()
tokenizer.build_vocab(smiles_list)

max_len = max(len(s) for s in smiles_list) + 2

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


def generate_smiles():

    with torch.no_grad():

        z = torch.randn(1, 128).to(device)

        hidden = torch.tanh(
            model.fc_latent_to_hidden(z)
        ).unsqueeze(0)

        cell = torch.zeros_like(hidden)

        start_token = tokenizer.char_to_idx["<start>"]

        current_token = torch.tensor(
            [[start_token]],
            device=device
        )

        generated = [start_token]

        for _ in range(max_len):

            embedded = model.embedding(current_token)

            output, (hidden, cell) = model.decoder_lstm(
                embedded,
                (hidden, cell)
            )

            logits = model.output_fc(output)

            next_token = torch.argmax(
                logits,
                dim=-1
            )

            token_id = next_token.item()

            if token_id == tokenizer.char_to_idx["<end>"]:
                break

            generated.append(token_id)

            current_token = next_token

        return tokenizer.decode(generated)