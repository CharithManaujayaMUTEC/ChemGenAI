import { useState } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";
import "./App.css";

const TECH_STACK = [
  { label: "PyTorch", sub: "VAE Model" },
  { label: "RDKit", sub: "Validation" },
  { label: "FastAPI", sub: "REST API" },
  { label: "React", sub: "Dashboard" },
  { label: "Docker", sub: "MLOps" },
  { label: "MLflow", sub: "Tracking" },
];

const PIPELINE = [
  { step: "01", title: "ZINC Dataset", desc: "20,000 molecular structures in SMILES format" },
  { step: "02", title: "VAE Training", desc: "LSTM-VAE learns latent chemical representations via PyTorch" },
  { step: "03", title: "Latent Sampling", desc: "Novel points sampled from the learned latent space" },
  { step: "04", title: "RDKit Validation", desc: "Generated SMILES verified for chemical validity" },
  { step: "05", title: "React Dashboard", desc: "Real-time rendering and interactive visualisation" },
];

function App() {
  const [smiles, setSmiles] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");

  const generateMolecule = async () => {
    try {
      setLoading(true);
      setError(false);
      setSmiles("");

      const response = await axios.post(
        "https://charithmanujaya1-chemgenai.hf.space/generate",
        { prompt: "Generate a molecule" }
      );

      setSmiles(response.data.generated_smiles);
      setValid(response.data.valid);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cg-root">
      <div className="cg-grid" />
      <div className="cg-orb cg-orb1" />
      <div className="cg-orb cg-orb2" />
      <div className="cg-orb cg-orb3" />

      <div className="cg-inner">

        {/* ── Hero header ── */}
        <header className="cg-header">
          <div className="cg-logo">
            <div className="cg-atom">
              <div className="cg-atom-ring" />
              <div className="cg-atom-dot" />
            </div>
            <div>
              <h1 className="cg-title">Chem<span>Gen</span>AI</h1>
              <p className="cg-subtitle">De Novo Molecular Generation Platform</p>
            </div>
          </div>
          <div className="cg-header-right">
            <div className="cg-badge">VAE · LSTM</div>
            <div className="cg-badge cg-badge-green">v1.0 · BETA</div>
          </div>
        </header>

        {/* ── Tagline ── */}
        <div className="cg-tagline">
          <p>
            Generative AI for early-stage <span>drug discovery</span> — exploring
            10<sup>60</sup>–10<sup>100</sup> possible drug-like molecules via latent-space sampling.
          </p>
        </div>

        {/* ── Stat strip ── */}
        <div className="cg-stats">
          <div className="cg-stat">
            <div className="cg-stat-val">20K</div>
            <div className="cg-stat-label">Training Molecules</div>
          </div>
          <div className="cg-stat-divider" />
          <div className="cg-stat">
            <div className="cg-stat-val">ZINC</div>
            <div className="cg-stat-label">Dataset Source</div>
          </div>
          <div className="cg-stat-divider" />
          <div className="cg-stat">
            <div className="cg-stat-val">VAE</div>
            <div className="cg-stat-label">Architecture</div>
          </div>
          <div className="cg-stat-divider" />
          <div className="cg-stat">
            <div className="cg-stat-val">RDKit</div>
            <div className="cg-stat-label">Validation Engine</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="cg-tabs">
          {["generate", "pipeline", "about"].map((tab) => (
            <button
              key={tab}
              className={`cg-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "generate" && "⬡ "}
              {tab === "pipeline" && "→ "}
              {tab === "about" && "◈ "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ══ TAB: GENERATE ══ */}
        {activeTab === "generate" && (
          <div className="cg-panel">
            <div className="cg-panel-intro">
              <p>Sample a novel molecule from the VAE's learned latent chemical space. Each generation produces a unique SMILES string validated by RDKit.</p>
            </div>

            <button className="cg-btn" onClick={generateMolecule} disabled={loading}>
              <span className="cg-btn-icon">⬡</span>
              {loading ? "Synthesising…" : "Generate Molecule"}
            </button>

            {loading && (
              <div className="cg-loading">
                <div className="cg-spinner" />
                <span>Sampling from latent space</span>
                <div className="cg-dots">
                  <div className="cg-dot" /><div className="cg-dot" /><div className="cg-dot" />
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="cg-empty cg-error">
                <div className="cg-empty-icon">⚠</div>
                <p>Failed to reach the API.<br />Check connection and try again.</p>
              </div>
            )}

            {smiles && !loading && (
              <div className="cg-result">
                <div className="cg-result-meta">
                  <div className="cg-smiles-card">
                    <div className="cg-smiles-label">SMILES NOTATION</div>
                    <div className="cg-smiles-text">{smiles}</div>
                  </div>
                  <div className={`cg-status ${valid ? "valid" : "invalid"}`}>
                    <div className="cg-status-dot" />
                    {valid ? "RDKit — Valid molecule structure" : "RDKit — Invalid molecule structure"}
                  </div>
                </div>
                <div className="cg-canvas-wrap">
                  <MoleculeViewer smiles={smiles} />
                </div>
              </div>
            )}

            {!smiles && !loading && !error && (
              <div className="cg-empty">
                <div className="cg-empty-icon">⬡</div>
                <p>Hit <strong>Generate</strong> to synthesise a novel molecule from the latent space</p>
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: PIPELINE ══ */}
        {activeTab === "pipeline" && (
          <div className="cg-panel">
            <div className="cg-panel-intro">
              <p>End-to-end ML pipeline from raw ZINC molecular data to a live API-served generative model, containerised with Docker and tracked via MLflow.</p>
            </div>

            <div className="cg-pipeline">
              {PIPELINE.map((item, i) => (
                <div className="cg-pipeline-item" key={i}>
                  <div className="cg-pipeline-step">{item.step}</div>
                  <div className="cg-pipeline-connector">
                    <div className="cg-pipeline-line" />
                  </div>
                  <div className="cg-pipeline-body">
                    <div className="cg-pipeline-title">{item.title}</div>
                    <div className="cg-pipeline-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cg-api-box">
              <div className="cg-smiles-label" style={{ marginBottom: "12px" }}>FASTAPI · SAMPLE REQUEST / RESPONSE</div>
              <div className="cg-api-row">
                <div className="cg-api-col">
                  <div className="cg-api-tag cg-api-tag-post">POST</div>
                  <div className="cg-smiles-text">/generate</div>
                  <pre className="cg-code">{`{
  "prompt": "Generate a molecule"
}`}</pre>
                </div>
                <div className="cg-api-arrow">→</div>
                <div className="cg-api-col">
                  <div className="cg-api-tag cg-api-tag-ok">200 OK</div>
                  <pre className="cg-code">{`{
  "generated_smiles":
    "CCOc1ccc(C(=O)
     NCc2ccco2)cc1Cl",
  "valid": true
}`}</pre>
                </div>
              </div>
            </div>

            <div className="cg-tech-grid">
              {TECH_STACK.map((t, i) => (
                <div className="cg-tech-chip" key={i}>
                  <div className="cg-tech-label">{t.label}</div>
                  <div className="cg-tech-sub">{t.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB: ABOUT ══ */}
        {activeTab === "about" && (
          <div className="cg-panel">
            <div className="cg-panel-intro">
              <p>ChemGenAI demonstrates how generative AI can assist early-stage drug discovery by autonomously proposing novel molecular candidates from an intractably large chemical search space.</p>
            </div>

            <div className="cg-about-grid">
              <div className="cg-about-card">
                <div className="cg-about-icon">◈</div>
                <div className="cg-about-heading">Problem</div>
                <p>Drug discovery takes 10+ years and billions in investment. The drug-like chemical space contains an estimated 10<sup>60</sup>–10<sup>100</sup> molecules — impossible to explore manually.</p>
              </div>
              <div className="cg-about-card">
                <div className="cg-about-icon">⬡</div>
                <div className="cg-about-heading">Approach</div>
                <p>A Variational Autoencoder (VAE) with LSTM layers is trained on 20,000 SMILES from the ZINC database, learning a continuous latent representation of chemical space.</p>
              </div>
              <div className="cg-about-card">
                <div className="cg-about-icon">→</div>
                <div className="cg-about-heading">Generation</div>
                <p>Novel molecules are created by sampling latent vectors and decoding them into SMILES strings. RDKit verifies chemical validity of each output.</p>
              </div>
              <div className="cg-about-card">
                <div className="cg-about-icon">◆</div>
                <div className="cg-about-heading">Future Work</div>
                <p>Lipinski's Rule of Five filtering, binding affinity estimation, toxicity prediction, RL-based optimisation, and GNN/Transformer architectures.</p>
              </div>
            </div>

            <div className="cg-course-box">
              <div className="cg-smiles-label">ACADEMIC CONTEXT</div>
              <p className="cg-course-text">
                Developed for <strong>EC7203 — Advanced Artificial Intelligence</strong><br />
                Department of Computer Engineering · University of Ruhuna
              </p>
            </div>
          </div>
        )}

        <footer className="cg-footer">
          ChemGenAI · University of Ruhuna · EC7203
          HuggingFace · Docker · MLflow
        </footer>
      </div>
    </div>
  );
}

export default App;