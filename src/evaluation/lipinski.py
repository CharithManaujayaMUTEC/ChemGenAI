def evaluate_lipinski(properties):
    """
    Evaluate Lipinski's Rule of Five.

    Returns
    -------
    dict
        Drug-likeness information.
    """

    violations = []

    if properties["molecular_weight"] > 500:
        violations.append("Molecular Weight > 500")

    if properties["logP"] > 5:
        violations.append("LogP > 5")

    if properties["h_bond_donors"] > 5:
        violations.append("Hydrogen Bond Donors > 5")

    if properties["h_bond_acceptors"] > 10:
        violations.append("Hydrogen Bond Acceptors > 10")

    return {

        "drug_like": len(violations) <= 1,

        "violations": violations,

        "violation_count": len(violations)

    }