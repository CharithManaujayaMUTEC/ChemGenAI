# <p align="center">🧪 ChemGenAI</p>

<p align="center">
  <img src="docs/logo.png" alt="ChemGenAI Logo" width="220"/>
</p>

<p align="center">
  <strong>AI-Powered De Novo Molecular Generation Platform</strong>
</p>

<p align="center">
  <a href="https://github.com/CharithManaujayaMUTEC/ChemGenAI">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" />
  </a>
  <a href="https://charithmanujaya1-chemgenai.hf.space">
    <img src="https://img.shields.io/badge/HuggingFace-Backend-yellow?logo=huggingface" />
  </a>
  <a href="https://chem-gen-ai-phi.vercel.app/">
    <img src="https://img.shields.io/badge/Vercel-Frontend-black?logo=vercel" />
  </a>
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python" />
  <img src="https://img.shields.io/badge/PyTorch-AI-red?logo=pytorch" />
  <img src="https://img.shields.io/badge/FastAPI-API-green?logo=fastapi" />
</p>

---

# Overview

ChemGenAI is an AI-powered molecular generation platform developed for computational chemistry and early-stage drug discovery research.

The platform employs a Long Short-Term Memory Variational Autoencoder (LSTM-VAE) trained on 20,000 molecular structures from the ZINC database. The model learns a continuous latent representation of chemical space and generates novel molecular structures through probabilistic latent-space sampling.

Generated molecules are validated using RDKit, stored in a SQLite database via SQLAlchemy, exposed through a FastAPI REST API, and visualized using an interactive React dashboard.

The backend is deployed on Hugging Face Spaces using Docker, while the frontend dashboard is deployed on Vercel. The project demonstrates the integration of deep learning, molecular informatics, web technologies, and MLOps practices into a complete AI-powered molecular generation pipeline.

---

# Live Deployment

### Frontend Dashboard

https://chem-gen-ai-phi.vercel.app/

### Backend API

https://charithmanujaya1-chemgenai.hf.space

### Source Code

https://github.com/CharithManaujayaMUTEC/ChemGenAI

---

# Problem Statement

Drug discovery is an expensive and time-consuming process that often requires more than a decade of research and billions of dollars in investment.

One of the major challenges is navigating the enormous chemical search space of potential drug-like compounds. The estimated number of possible drug-like molecules ranges between:

10⁶⁰ – 10¹⁰⁰

Traditional computational methods cannot exhaustively explore this space. Generative AI approaches are increasingly being used in modern drug discovery to efficiently explore chemical space and propose novel molecular candidates.

ChemGenAI addresses this challenge by learning latent molecular representations from real chemical structures and generating novel molecules through latent-space sampling.

---

# Project Objectives

- Learn latent molecular representations using a Variational Autoencoder (VAE)
- Generate novel molecular structures through latent-space sampling
- Validate generated molecules using RDKit
- Persist generated molecules using SQLite and SQLAlchemy
- Visualize generated molecules through a React dashboard
- Expose molecular generation capabilities through a FastAPI REST API
- Track experiments using MLflow
- Demonstrate an end-to-end MLOps workflow using Docker and Hugging Face Spaces

---

# Key Features

| Feature                      | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| De Novo Molecular Generation | Generates novel molecular structures from latent-space sampling |
| LSTM-VAE Architecture        | Learns molecular representations from SMILES sequences          |
| RDKit Validation             | Verifies chemical validity of generated molecules               |
| SQLite Persistence           | Stores generated molecules and metadata                         |
| Generation History           | Tracks previous molecule generations                            |
| React Dashboard              | Interactive user interface for molecule generation              |
| Molecular Visualization      | Converts SMILES into 2D chemical structures                     |
| FastAPI Backend              | REST API for inference and data access                          |
| MLflow Tracking              | Experiment tracking and model management                        |
| Docker Deployment            | Containerized application deployment                            |
| Hugging Face Backend         | Cloud-hosted FastAPI service                                    |
| Vercel Frontend              | Public dashboard deployment                                     |

---

# Experimental Results

## Training Configuration

| Parameter           | Value            |
| ------------------- | ---------------- |
| Dataset Size        | 20,000 Molecules |
| Epochs              | 15               |
| Embedding Dimension | 128              |
| Hidden Dimension    | 256              |
| Latent Dimension    | 128              |
| Batch Size          | 64               |
| Learning Rate       | 0.001            |

## Training Performance

| Metric                     | Value      |
| -------------------------- | ---------- |
| Final Training Loss        | 0.6056     |
| Latent Space Sampling      | Enabled    |
| RDKit Validation           | Enabled    |
| FastAPI Deployment         | Successful |
| Hugging Face Deployment    | Successful |
| React Dashboard Deployment | Successful |

The trained LSTM-VAE successfully learns latent molecular representations and generates chemically meaningful molecular structures through latent-space sampling.

---

# Authors

Charith Manujaya

---

# License

This project is developed solely for academic and research purposes.
