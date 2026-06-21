# ⬡ ChemGenAI

> **AI-Powered De Novo Molecular Generation Platform**  
> EC7203 Advanced Artificial Intelligence · University of Ruhuna, Department of Computer Engineering

---

## Overview

ChemGenAI is a generative AI platform for **de novo molecular generation** targeting early-stage drug discovery. It leverages a **Variational Autoencoder (VAE) with LSTM layers** trained on molecular structures from the ZINC database, learning a continuous latent representation of chemical space to generate novel, chemically valid molecules on demand.

Generated molecules are validated in real-time using **RDKit**, persisted to a **SQLite database via SQLAlchemy**, and visualised through an interactive **React dashboard** backed by a **FastAPI REST API** deployed end-to-end on **Hugging Face Spaces** using Docker.

---

## Problem Statement

Drug discovery is a time-consuming and expensive process often taking over a decade and billions of dollars in investment. One of the core challenges is identifying promising molecular candidates from an astronomically large chemical search space:

```
Estimated drug-like molecules:  10⁶⁰ – 10¹⁰⁰
```

Traditional approaches cannot exhaustively explore this space. ChemGenAI addresses this by using **generative AI to autonomously propose novel molecular structures** as potential starting points for further pharmaceutical research.

---

## Objectives

- Learn latent representations of molecular structures using a Variational Autoencoder (VAE)
- Generate novel molecules via latent-space sampling
- Validate generated molecular structures using RDKit
- Persist generation history using SQLite + SQLAlchemy
- Provide real-time molecule visualisation through a React dashboard
- Expose molecular generation capabilities through a FastAPI REST API
- Demonstrate an end-to-end MLOps workflow using Docker, MLflow, and Hugging Face Spaces

---

## Key Features

| Feature                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| **De Novo Generation** | Samples novel molecules from the VAE's learned latent space                 |
| **RDKit Validation**   | Verifies chemical validity of every generated SMILES string                 |
| **Generation History** | Persists all generated molecules to SQLite via SQLAlchemy                   |
| **2D Visualisation**   | Renders molecular structures via SmilesDrawer in a React dashboard          |
| **REST API**           | FastAPI backend with `/generate`, `/history`, `/health`, `/ping` endpoints  |
| **MLOps Pipeline**     | Docker containerisation, MLflow experiment tracking, HuggingFace deployment |

---

## System Architecture

```
┌─────────────────────┐
│    ZINC Dataset     │  20,000 molecular structures (SMILES format)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    VAE Training     │  LSTM-VAE learns latent chemical representations
│     (PyTorch)       │  via reconstruction loss + KL divergence
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Trained LSTM-VAE   │  Saved as lstm_vae.pt with vocab.json
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Latent Sampling    │  Random vector sampled from N(0, I)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Molecular Generation│  Decoder produces SMILES string
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  RDKit Validation   │  Chemical validity check on generated SMILES
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  SQLite / SQLAlchemy│  Molecule + validity + prompt persisted to DB
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  FastAPI REST API   │  /generate · /history · /health · /ping
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   React Dashboard   │  Tabbed UI: Generate · Pipeline · History · About
│  (Vite + Axios)     │  Molecule rendering via SmilesDrawer
└─────────────────────┘
```

---

## API Reference

**Base URL:** `https://charithmanujaya1-chemgenai.hf.space`

### `POST /generate`

Generates a novel molecule by sampling from the VAE's latent space.

**Request**

```json
{
  "prompt": "Generate a molecule"
}
```

**Response**

```json
{
  "prompt": "Generate a molecule",
  "generated_smiles": "CCOc1ccc(C(=O)NCc2ccco2)cc1Cl",
  "valid": true
}
```

---

### `GET /history`

Returns the last 50 generated molecules ordered by most recent.

**Response**

```json
[
  {
    "id": 42,
    "smiles": "CCOc1ccc(C(=O)NCc2ccco2)cc1Cl",
    "valid": true,
    "prompt": "Generate a molecule",
    "created_at": "2025-06-10T14:32:01.123456"
  }
]
```

---

### `GET /health`

```json
{ "status": "healthy" }
```

### `GET /ping`

```json
{ "message": "pong" }
```

---

## Technology Stack

### Artificial Intelligence

- **PyTorch** VAE model training and inference
- **Variational Autoencoder (VAE)** with LSTM encoder/decoder
- Latent-space molecular sampling

### Computational Chemistry

- **RDKit** SMILES validation and chemical structure verification
- SMILES molecular representation format

### Backend

- **FastAPI** REST API framework
- **Uvicorn** ASGI server
- **SQLAlchemy** ORM for molecule persistence
- **SQLite** Lightweight generation history database
- **Python 3.10+**

### Frontend

- **React** + **Vite** Component-based UI
- **Axios** HTTP client
- **SmilesDrawer** 2D molecular structure rendering
- **Syne** + **Space Mono** Typography

### MLOps & Deployment

- **Docker** Containerisation
- **MLflow** Experiment tracking and model versioning
- **GitHub** Version control
- **Hugging Face Spaces** API deployment
- **Vercel** Frontend deployment

---

## Project Structure

```
ChemGenAI/
│
├── frontend/                  # React + Vite dashboard
│   ├── src/
│   │   ├── App.jsx            # Main application (tabbed UI)
│   │   ├── App.css            # Dark sci-fi design system
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Viewport reset
│   │   └── components/
│   │       └── MoleculeViewer.jsx  # SmilesDrawer canvas wrapper
│   ├── public/
│   └── dist/                  # Production build output
│
├── models/
│   ├── lstm_vae.pt            # Trained VAE model weights
│   └── vocab.json             # SMILES character vocabulary
│
├── src/
│   ├── api/
│   │   ├── main.py            # FastAPI app + route definitions
│   │   └── model_service.py   # SMILES generation logic
│   ├── data/                  # ZINC dataset processing
│   ├── database/
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   └── models.py          # Molecule ORM model
│   ├── evaluation/
│   │   └── metrics.py         # RDKit validity check
│   ├── models/
│   │   └── lstm_vae.py        # VAE model architecture
│   └── utils/                 # Shared utilities
│
├── Dockerfile                 # Container definition
├── requirements.txt           # Python dependencies
├── README.md
└── .gitignore
```

---

## Dataset

ChemGenAI is trained on molecular structures from the **ZINC database** a widely used repository of commercially available chemical compounds for virtual screening and drug discovery research.

| Property | Value                                                 |
| -------- | ----------------------------------------------------- |
| Source   | ZINC Database                                         |
| Size     | 20,000 molecular structures                           |
| Format   | SMILES (Simplified Molecular Input Line Entry System) |
| Use      | VAE training encoder input and decoder target         |

---

## Model Architecture

The core generative model is an **LSTM-VAE** (Long Short-Term Memory Variational Autoencoder):

- **Encoder** Bidirectional LSTM processes the input SMILES sequence character by character, producing mean (μ) and log-variance (σ²) vectors that parameterise the latent distribution
- **Latent Space** A continuous vector space where nearby points correspond to structurally similar molecules; novel molecules are generated by sampling random points
- **Decoder** Autoregressive LSTM decodes sampled latent vectors back into SMILES character sequences
- **Training Objective** ELBO loss = Reconstruction loss (cross-entropy) + KL divergence penalty

---

## Future Enhancements

- [ ] Drug-likeness prediction using Lipinski's Rule of Five
- [ ] Molecular property prediction (logP, MW, TPSA)
- [ ] Binding affinity estimation
- [ ] Toxicity prediction
- [ ] Target-specific molecule generation (conditional VAE)
- [ ] Reinforcement Learning-based molecule optimisation
- [ ] Graph Neural Network (GNN) integration
- [ ] Transformer-based molecular generation (SMILES-GPT)

---

## Research Contribution

ChemGenAI demonstrates how generative AI can be applied to computational chemistry by learning latent molecular representations and generating chemically valid structures. The project integrates **deep learning, molecular informatics, web technologies, and MLOps practices** into a complete AI-driven molecular generation pipeline showing that generative models can meaningfully contribute to the early-stage drug discovery process by autonomously proposing candidate structures from a near-infinite chemical search space.

---

## Authors

Developed as part of the **EC7203 Advanced Artificial Intelligence** course project.

**University of Ruhuna**  
Department of Computer Engineering

---

## License

This project is developed for academic and research purposes only.
