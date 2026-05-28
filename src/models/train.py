import mlflow
import mlflow.pytorch
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from src.data.load_data import load_zinc_subset
from src.data.preprocess import (
    SmilesTokenizer,
    SmilesDataset
)

from src.models.lstm_vae import LSTMVAE


# Load dataset
smiles_list = load_zinc_subset(5000)

# Tokenizer
tokenizer = SmilesTokenizer()
tokenizer.build_vocab(smiles_list)

# Max sequence length
max_len = max(len(s) for s in smiles_list) + 2

# Dataset
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

# Device
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

# Model
model = LSTMVAE(
    vocab_size=len(tokenizer.vocab),
    embedding_dim=128,
    hidden_dim=256,
    latent_dim=128
).to(device)

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)

criterion = nn.CrossEntropyLoss(ignore_index=0)


def vae_loss(logits, targets, mu, logvar):

    reconstruction = criterion(
        logits.view(-1, logits.size(-1)),
        targets.view(-1)
    )

    kl_loss = -0.5 * torch.mean(
        1 + logvar - mu.pow(2) - logvar.exp()
    )

    return reconstruction + kl_loss


# Training loop
epochs = 5

for epoch in range(epochs):

    model.train()

    total_loss = 0

    for batch in dataloader:

        batch = batch.to(device)

        optimizer.zero_grad()

        logits, mu, logvar = model(batch)

        loss = vae_loss(
            logits,
            batch,
            mu,
            logvar
        )

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

    avg_loss = total_loss / len(dataloader)

    print(f"Epoch {epoch+1} Loss: {avg_loss:.4f}")