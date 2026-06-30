from rdkit import Chem
from rdkit.Chem import Descriptors
from rdkit.Chem import Lipinski


def calculate_properties(smiles: str):
    """
    Calculate standard molecular descriptors using RDKit.
    """

    mol = Chem.MolFromSmiles(smiles)

    if mol is None:

        return None

    properties = {

        "molecular_weight": round(
            Descriptors.MolWt(mol),
            2
        ),

        "logP": round(
            Descriptors.MolLogP(mol),
            2
        ),

        "tpsa": round(
            Descriptors.TPSA(mol),
            2
        ),

        "h_bond_donors": Lipinski.NumHDonors(
            mol
        ),

        "h_bond_acceptors": Lipinski.NumHAcceptors(
            mol
        ),

        "rotatable_bonds": Lipinski.NumRotatableBonds(
            mol
        ),

        "ring_count": Lipinski.RingCount(
            mol
        ),

        "heavy_atoms": Lipinski.HeavyAtomCount(
            mol
        )

    }

    return properties