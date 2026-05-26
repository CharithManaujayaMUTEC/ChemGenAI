import torch
import torch.nn as nn


class LSTMVAE(nn.Module):

    def __init__(
        self,
        vocab_size,
        embedding_dim,
        hidden_dim,
        latent_dim,
        num_layers=1
    ):

        super(LSTMVAE, self).__init__()

        self.hidden_dim = hidden_dim
        self.latent_dim = latent_dim

        # Embedding
        self.embedding = nn.Embedding(
            vocab_size,
            embedding_dim,
            padding_idx=0
        )

        # Encoder
        self.encoder_lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            batch_first=True,
            num_layers=num_layers
        )

        # Latent space
        self.fc_mu = nn.Linear(hidden_dim, latent_dim)
        self.fc_logvar = nn.Linear(hidden_dim, latent_dim)

        # Latent → hidden
        self.fc_latent_to_hidden = nn.Linear(
            latent_dim,
            hidden_dim
        )

        # Decoder
        self.decoder_lstm = nn.LSTM(
            embedding_dim,
            hidden_dim,
            batch_first=True,
            num_layers=num_layers
        )

        self.output_fc = nn.Linear(
            hidden_dim,
            vocab_size
        )

    def encode(self, x):

        embedded = self.embedding(x)

        _, (hidden, _) = self.encoder_lstm(embedded)

        hidden = hidden[-1]

        mu = self.fc_mu(hidden)
        logvar = self.fc_logvar(hidden)

        return mu, logvar

    def reparameterize(self, mu, logvar):

        std = torch.exp(0.5 * logvar)

        eps = torch.randn_like(std)

        return mu + eps * std

    def decode(self, z, x):

        embedded = self.embedding(x)

        hidden = torch.tanh(
            self.fc_latent_to_hidden(z)
        )

        hidden = hidden.unsqueeze(0)

        cell = torch.zeros_like(hidden)

        outputs, _ = self.decoder_lstm(
            embedded,
            (hidden, cell)
        )

        logits = self.output_fc(outputs)

        return logits

    def forward(self, x):

        mu, logvar = self.encode(x)

        z = self.reparameterize(mu, logvar)

        logits = self.decode(z, x)

        return logits, mu, logvar