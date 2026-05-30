import json

from src.data.load_data import load_zinc_subset
from src.data.preprocess import SmilesTokenizer

smiles = load_zinc_subset(5000)

tokenizer = SmilesTokenizer()
tokenizer.build_vocab(smiles)

with open("models/vocab.json", "w") as f:
    json.dump(tokenizer.vocab, f)

print("Vocabulary saved")