# ChemGenAI

## AI-Driven Molecular Generation Platform using LSTM-VAE, Transformers, and MLOps

---

# 1. Project Overview

ChemGenAI is an advanced artificial intelligence platform designed to generate novel chemical molecules using deep generative models. The system combines Variational Autoencoders (VAEs), sequence modeling with LSTMs, transformer-based NLP techniques, and MLOps practices to create a scalable molecular generation pipeline.

The project focuses on treating molecular structures as language sequences using SMILES notation and generating chemically meaningful new molecules through latent-space learning.

---

# 2. Core Objectives

## Main Goals

- Learn molecular representations using SMILES sequences
- Generate novel molecule structures using LSTM-VAE
- Integrate NLP/Transformer models for prompt-guided molecule generation
- Build a modular and scalable AI platform
- Apply MLOps concepts such as experiment tracking, API deployment, Dockerization, and CI/CD

---

# 3. Technologies Used

## Artificial Intelligence

- PyTorch
- LSTM-VAE
- Transformer Models
- HuggingFace Datasets
- NLP Tokenization

## MLOps & Deployment

- MLflow
- FastAPI
- Docker
- GitHub Actions
- GitHub Repository Management

## Utilities

- NumPy
- Pandas
- YAML Configurations
- tqdm

---

# 4. AI Concepts Covered from Course Modules

| Course Topic             | Project Usage                    |
| ------------------------ | -------------------------------- |
| Text Preprocessing       | SMILES tokenization and encoding |
| Word Embeddings          | Embedding layer in LSTM-VAE      |
| Transformers/GPTs        | NLP prompt encoder               |
| Variational Autoencoders | Core generative model            |
| GANs                     | Literature review and comparison |
| MLOps                    | MLflow, Docker, FastAPI, CI/CD   |

---

# 5. System Architecture

```text
User Prompt
    ↓
Transformer Prompt Encoder
    ↓
Condition Vector
    ↓
LSTM Variational Autoencoder
    ↓
Generated Molecule Sequences
    ↓
Evaluation Pipeline
    ↓
FastAPI Service
    ↓
Deployment Environment
```

---

# 6. Repository Structure

```text
ChemGenAI/
│
├── data/
│   ├── raw/
│   ├── processed/
│
├── notebooks/
│
├── src/
│   ├── data/
│   │   ├── load_data.py
│   │   ├── preprocess.py
│   │
│   ├── models/
│   │   ├── lstm_vae.py
│   │   ├── train.py
│   │   ├── generate.py
│   │
│   ├── evaluation/
│   │   ├── metrics.py
│   │
│   ├── api/
│   │   ├── app.py
│
├── configs/
│   ├── config.yaml
│
├── tests/
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── README.md
```

---

# 7. Dataset Information

## Dataset Used

Primary Dataset:

- ZINC Canonicalized Dataset

Dataset Source:

- HuggingFace Datasets

## Dataset Characteristics

- Millions of molecular SMILES sequences
- Drug-like molecules
- Public and open-source

---

# 8. Installation Guide

## Clone Repository

```bash
git clone https://github.com/CharithManaujayaMUTEC/ChemGenAI.git
cd ChemGenAI
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux/Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 9. Running the Project

## Step 1 — Test Dataset Loader

```bash
python -m src.data.load_data
```

---

## Step 2 — Train LSTM-VAE Model

```bash
python -m src.models.train
```

Expected Output:

```text
Epoch 1 Loss: ...
Epoch 2 Loss: ...
```

---

## Step 3 — Generate Molecules

```bash
python -m src.models.generate
```

Expected Output:

```text
1: CCOCN
2: CCCO
3: C1=CC=CC=C1
```

---

# 10. Google Colab Workflow

## Clone Repository in Colab

```python
!git clone https://github.com/CharithManaujayaMUTEC/ChemGenAI.git
%cd ChemGenAI
```

---

## Install Dependencies in Colab

```python
!pip install -r requirements.txt
```

---

## Run Training in Colab

```python
!python -m src.models.train
```

---

# 11. Docker Deployment (Planned)

## Build Docker Image

```bash
docker build -t chemgenai .
```

---

## Run Container

```bash
docker run -p 8000:8000 chemgenai
```

---

# 12. FastAPI Service (Planned)

## Start API Server

```bash
uvicorn src.api.app:app --reload
```

---

## Example Endpoint

### POST /generate

Request:

```json
{
  "prompt": "Generate low toxicity molecule"
}
```

Response:

```json
{
  "generated_smiles": "CCOCCN"
}
```

---

# 13. MLflow Integration (Planned)

## Start MLflow UI

```bash
mlflow ui
```

---

## Access Dashboard

```text
http://localhost:5000
```

---

# 14. Future Enhancements

- Conditional VAE
- Transformer-guided generation
- Molecular property prediction
- RDKit validation
- Attention-based decoder
- Kubernetes deployment
- CI/CD automation
- Streamlit dashboard

---

# 16. Branching Strategy

Each team member should work on separate feature branches.

## Suggested Branch Names

```text
feature/mlops-api
feature/lstm-vae
feature/nlp-transformer
feature/evaluation
```

---

# 17. Git Workflow

## Pull Latest Changes

```bash
git pull origin main
```

---

## Create New Branch

```bash
git checkout -b feature/mlops-api
```

---

## Commit Changes

```bash
git add .
git commit -m "Added MLflow integration"
```

---

## Push Branch

```bash
git push origin feature/mlops-api
```

---

# 19. Research Contribution

## Novel Contribution

The project combines:

- NLP-guided prompt understanding
- Transformer embeddings
- LSTM-based Variational Autoencoders
- Molecular latent-space generation
- MLOps deployment architecture

into a unified molecular generation platform.

---

# 20. Authors

EC7203 — Advanced Artificial Intelligence Project

University Project Team

ChemGenAI Development Team
