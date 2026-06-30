import re


def parse_prompt(prompt: str):
    """
    Parses a natural language prompt and converts it into
    generation settings for ChemGenAI.

    NOTE:
    This does NOT make the LSTM-VAE understand English.
    It simply extracts user intent and adjusts generation
    parameters accordingly.
    """

    prompt = prompt.lower().strip()

    settings = {

        # Generation controls
        "temperature": 0.8,
        "max_length": 120,
        "num_candidates": 20,

        # User preferences
        "preferred_features": [],
        "keywords": []
    }

    keyword_map = {

        # Diversity
        "diverse": ("temperature", 1.2),
        "novel": ("temperature", 1.2),
        "creative": ("temperature", 1.2),
        "random": ("temperature", 1.1),

        # Stability
        "stable": ("temperature", 0.6),
        "simple": ("temperature", 0.7),

        # Size
        "small": ("max_length", 80),
        "medium": ("max_length", 120),
        "large": ("max_length", 160),
        "long": ("max_length", 180),

        # Chemistry
        "organic": ("feature", "organic"),
        "aromatic": ("feature", "aromatic"),
        "benzene": ("feature", "benzene"),
        "ring": ("feature", "ring"),
        "alcohol": ("feature", "alcohol"),
        "amine": ("feature", "amine"),
        "ketone": ("feature", "ketone"),
        "ester": ("feature", "ester"),
        "amide": ("feature", "amide"),
        "ether": ("feature", "ether"),
        "acid": ("feature", "acid"),
        "polar": ("feature", "polar"),
        "nonpolar": ("feature", "nonpolar"),
        "hydrophobic": ("feature", "hydrophobic"),
        "hydrophilic": ("feature", "hydrophilic"),

        # Drug discovery
        "drug": ("feature", "drug"),
        "drug-like": ("feature", "drug"),
        "medicine": ("feature", "drug"),
        "lead": ("feature", "lead"),
        "candidate": ("feature", "candidate")
    }

    words = re.findall(r"[A-Za-z\-]+", prompt)

    for word in words:

        if word not in keyword_map:
            continue

        settings["keywords"].append(word)

        action, value = keyword_map[word]

        if action == "temperature":

            settings["temperature"] = value

        elif action == "max_length":

            settings["max_length"] = value

        elif action == "feature":

            settings["preferred_features"].append(value)

    return settings