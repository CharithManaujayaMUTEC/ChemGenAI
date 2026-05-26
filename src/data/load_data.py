from datasets import load_dataset
from preprocess import SmilesTokenizer, SmilesDataset

from torch.utils.data import DataLoader


def load_zinc_subset(size=10000):

    dataset = load_dataset("sagawa/ZINC-canonicalized")

    train = dataset["train"].select(range(size))

    return train["smiles"]


if __name__ == "__main__":

    smiles_list = load_zinc_subset()

    print("Loaded molecules:", len(smiles_list))

    tokenizer = SmilesTokenizer()

    tokenizer.build_vocab(smiles_list)

    max_len = max(len(s) for s in smiles_list) + 2

    dataset = SmilesDataset(
        smiles_list,
        tokenizer,
        max_len
    )

    dataloader = DataLoader(
        dataset,
        batch_size=32,
        shuffle=True
    )

    batch = next(iter(dataloader))

    print(batch.shape)

    print(tokenizer.decode(batch[0].numpy()))