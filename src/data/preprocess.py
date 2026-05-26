import numpy as np
import torch
from torch.utils.data import Dataset


class SmilesTokenizer:
    def __init__(self):
        self.char_to_idx = {}
        self.idx_to_char = {}
        self.vocab = []

    def build_vocab(self, smiles_list):

        chars = sorted(list(set("".join(smiles_list))))

        self.vocab = ["<pad>", "<start>", "<end>"] + chars

        self.char_to_idx = {
            ch: idx for idx, ch in enumerate(self.vocab)
        }

        self.idx_to_char = {
            idx: ch for ch, idx in self.char_to_idx.items()
        }

    def encode(self, smiles, max_len):

        seq = [self.char_to_idx["<start>"]]

        for ch in smiles:
            seq.append(self.char_to_idx[ch])

        seq.append(self.char_to_idx["<end>"])

        padding = [self.char_to_idx["<pad>"]] * (max_len - len(seq))

        return seq + padding

    def decode(self, tokens):

        chars = []

        for token in tokens:

            char = self.idx_to_char.get(int(token), "")

            if char in ["<pad>", "<start>", "<end>"]:
                continue

            chars.append(char)

        return "".join(chars)


class SmilesDataset(Dataset):

    def __init__(self, smiles_list, tokenizer, max_len):

        self.smiles_list = smiles_list
        self.tokenizer = tokenizer
        self.max_len = max_len

        self.encoded = [
            tokenizer.encode(smiles, max_len)
            for smiles in smiles_list
        ]

    def __len__(self):
        return len(self.encoded)

    def __getitem__(self, idx):

        x = torch.tensor(
            self.encoded[idx],
            dtype=torch.long
        )

        return x