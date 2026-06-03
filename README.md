---

title: ChemGenAI
emoji: 🧪
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
-------------

# ChemGenAI

## AI-Powered De Novo Molecular Generation Platform

ChemGenAI is an Advanced Artificial Intelligence project focused on **de novo molecular generation for early-stage drug discovery**. The platform leverages a **Variational Autoencoder (VAE)** trained on molecular structures from the ZINC database to learn latent chemical representations and generate novel, chemically valid molecules.

The generated molecules are validated and visualized through an interactive web dashboard, demonstrating the application of deep learning techniques in computational chemistry and pharmaceutical research.

---

## Problem Statement

Drug discovery is a time-consuming and expensive process that can require over a decade of research and billions of dollars in investment. One of the major challenges is identifying promising molecular candidates from an enormous chemical search space containing an estimated:

10⁶⁰ – 10¹⁰⁰ possible drug-like molecules.

Traditional approaches cannot exhaustively explore this space. ChemGenAI addresses this challenge by utilizing generative artificial intelligence to automatically propose novel molecular structures that may serve as potential starting points for further pharmaceutical research.

---

## Objectives

- Learn latent representations of molecular structures using a Variational Autoencoder.
- Generate novel molecules using latent-space sampling.
- Validate generated molecular structures using RDKit.
- Provide real-time molecule visualization through a React dashboard.
- Expose molecular generation capabilities through a FastAPI REST API.
- Demonstrate an end-to-end MLOps workflow using Docker, MLflow, and Hugging Face Spaces.

---

## Key Features

### Molecular Generation

- Variational Autoencoder (VAE) architecture
- Latent-space molecular sampling
- Novel molecule generation
- SMILES-based molecular representation

### Molecular Validation

- RDKit chemical validation
- Detection of valid and invalid generated molecules
- Chemical structure verification

### Molecular Visualization

- Interactive React dashboard
- Real-time molecular structure rendering
- SMILES visualization using molecular drawing libraries

### REST API

- FastAPI-powered backend
- JSON-based API endpoints
- Hugging Face Space deployment

### MLOps Integration

- Docker containerization
- MLflow experiment tracking
- Model versioning support
- Reproducible deployment pipeline

---

## Technology Stack

### Artificial Intelligence

- PyTorch
- Variational Autoencoder (VAE)
- Deep Learning
- Generative AI

### Computational Chemistry

- RDKit
- SMILES Molecular Representation

### Backend

- FastAPI
- Uvicorn
- Python

### Frontend

- React
- Vite
- Axios
- SmilesDrawer

### MLOps & Deployment

- Docker
- MLflow
- GitHub
- Hugging Face Spaces
- Vercel

---

## System Architecture

```text
                    +----------------------+
                    |   ZINC Dataset       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |     VAE Training      |
                    |      (PyTorch)        |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |  Trained LSTM-VAE    |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Latent Space Sampling|
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | Molecular Generation |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | RDKit Validation     |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | FastAPI REST API     |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    | React Dashboard      |
                    | Molecule Rendering   |
                    +----------------------+
```

---

## Project Structure

```text
ChemGenAI
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── dist/
│
├── models/
│   ├── lstm_vae.pt
│   └── vocab.json
│
├── src/
│   ├── api/
│   ├── data/
│   ├── evaluation/
│   ├── models/
│   └── utils/
│
├── Dockerfile
├── requirements.txt
├── README.md
└── .gitignore
```

---

## API Example

### Request

```json
{
  "prompt": "Generate a molecule"
}
```

### Response

```json
{
  "prompt": "Generate a molecule",
  "generated_smiles": "CCOc1ccc(C(=O)NCc2ccco2)cc1Cl",
  "valid": true
}
```

---

## Dataset

ChemGenAI is trained using molecular structures derived from the ZINC database, a widely used repository of commercially available chemical compounds for virtual screening and drug discovery research.

Dataset Size Used:

- 20,000 molecular structures
- SMILES representation format

---

## Future Enhancements

- Drug-likeness prediction using Lipinski's Rule of Five
- Molecular property prediction
- Binding affinity estimation
- Toxicity prediction
- Target-specific molecule generation
- Reinforcement Learning-based molecule optimization
- Graph Neural Network (GNN) integration
- Transformer-based molecular generation

---

## Research Contribution

ChemGenAI demonstrates how generative artificial intelligence can be applied to computational chemistry by learning latent molecular representations and generating chemically valid structures. The project showcases the integration of deep learning, molecular informatics, web technologies, and MLOps practices into a complete AI-driven molecular generation pipeline.

---

## Authors

Developed as part of the EC7203 – Advanced Artificial Intelligence course project.

University of Ruhuna
Department of Computer Engineering

---

## License

This project is developed for academic and research purposes.
