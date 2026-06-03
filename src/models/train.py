import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

import mlflow
import mlflow.pytorch

mlflow.set_tracking_uri("file:./mlruns")

from src.data.load_data import load_zinc_subset
from src.data.preprocess import (
    SmilesTokenizer,
    SmilesDataset
)

from src.models.lstm_vae import LSTMVAE


# =========================
# LOAD DATASET
# =========================

print("Loading dataset...")

smiles_list = load_zinc_subset(20000)

print(f"Loaded {len(smiles_list)} molecules")


# =========================
# TOKENIZER
# =========================

tokenizer = SmilesTokenizer()

tokenizer.build_vocab(smiles_list)

os.makedirs("models", exist_ok=True)

with open("models/vocab.json", "w") as f:
    json.dump(tokenizer.vocab, f)

print("Tokenizer saved")

print(f"Vocabulary Size: {len(tokenizer.vocab)}")


# =========================
# MAX SEQUENCE LENGTH
# =========================

max_len = max(len(s) for s in smiles_list) + 2

print(f"Max Sequence Length: {max_len}")


# =========================
# DATASET
# =========================

dataset = SmilesDataset(
    smiles_list,
    tokenizer,
    max_len
)

dataloader = DataLoader(
    dataset,
    batch_size=64,
    shuffle=True
)


# =========================
# DEVICE
# =========================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Using device: {device}")

# =========================
# TRAINING CONFIG
# =========================

epochs = 15
embedding_dim = 128
hidden_dim = 256
latent_dim = 128
learning_rate = 0.001
batch_size = 64


# =========================
# CREATE MODEL
# =========================

model = LSTMVAE(
    vocab_size=len(tokenizer.vocab),
    embedding_dim=embedding_dim,
    hidden_dim=hidden_dim,
    latent_dim=latent_dim
).to(device)


# =========================
# OPTIMIZER & LOSS
# =========================

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=learning_rate
)

criterion = nn.CrossEntropyLoss(
    ignore_index=0
)


# =========================
# VAE LOSS FUNCTION
# =========================

def vae_loss(logits, targets, mu, logvar):

    reconstruction_loss = criterion(
        logits.reshape(
            -1,
            logits.size(-1)
        ),
        targets.reshape(-1)
    )

    kl_loss = -0.5 * torch.mean(
        1 +
        logvar -
        mu.pow(2) -
        logvar.exp()
    )

    return reconstruction_loss + kl_loss


# =========================
# CREATE DIRECTORIES
# =========================

os.makedirs("models", exist_ok=True)


# =========================
# START MLFLOW
# =========================

if mlflow.active_run():
    mlflow.end_run()

mlflow.start_run()

print("MLflow run started")


# =========================
# LOG HYPERPARAMETERS
# =========================

mlflow.log_param("embedding_dim", embedding_dim)
mlflow.log_param("hidden_dim", hidden_dim)
mlflow.log_param("latent_dim", latent_dim)
mlflow.log_param("learning_rate", learning_rate)
mlflow.log_param("batch_size", batch_size)
mlflow.log_param("epochs", epochs)
mlflow.log_param("dataset_size", len(smiles_list))
mlflow.log_param("max_len", max_len)
mlflow.log_param("vocab_size", len(tokenizer.vocab))


# =========================
# TRAINING LOOP
# =========================

print("Starting training...")

for epoch in range(epochs):

    model.train()

    total_loss = 0

    for batch in dataloader:

        batch = batch.to(device)

        # Teacher forcing inputs
        inputs = batch[:, :-1]

        # Next-token prediction targets
        targets = batch[:, 1:]

        optimizer.zero_grad()

        logits, mu, logvar = model(inputs)

        loss = vae_loss(
            logits,
            targets,
            mu,
            logvar
        )

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(dataloader)

    print(
        f"Epoch {epoch + 1}/{epochs} | Loss: {avg_loss:.4f}"
    )

    mlflow.log_metric(
        "loss",
        avg_loss,
        step=epoch
    )


# =========================
# SAVE MODEL
# =========================

torch.save(
    model.state_dict(),
    "models/lstm_vae.pt"
)

print("Model saved locally")


# =========================
# LOG MODEL TO MLFLOW
# =========================

mlflow.pytorch.log_model(
    model,
    "lstm_vae_model"
)

print("Model logged to MLflow")


# =========================
# END MLFLOW
# =========================

mlflow.end_run()

print("MLflow run completed")