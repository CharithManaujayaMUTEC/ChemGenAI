import { useState } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";
import "./App.css";

function App() {
  const [smiles, setSmiles] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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

      <div className="cg-inner">
        <header className="cg-header">
          <div className="cg-logo">
            <div className="cg-atom">
              <div className="cg-atom-dot" />
            </div>
            <h1 className="cg-title">
              Chem<span>Gen</span>AI
            </h1>
          </div>
          <div className="cg-badge">v1.0 · BETA</div>
        </header>

        <button
          className="cg-btn"
          onClick={generateMolecule}
          disabled={loading}
        >
          <span className="cg-btn-icon">⬡</span>
          Generate Molecule
        </button>

        {loading && (
          <div className="cg-loading">
            <div className="cg-spinner" />
            <span>Synthesising molecule</span>
            <div className="cg-dots">
              <div className="cg-dot" />
              <div className="cg-dot" />
              <div className="cg-dot" />
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
            <div className="cg-smiles-card">
              <div className="cg-smiles-label">SMILES NOTATION</div>
              <div className="cg-smiles-text">{smiles}</div>
            </div>

            <div className={`cg-status ${valid ? "valid" : "invalid"}`}>
              <div className="cg-status-dot" />
              {valid ? "Valid molecule structure" : "Invalid molecule structure"}
            </div>

            <div className="cg-canvas-wrap">
              <MoleculeViewer smiles={smiles} />
            </div>
          </div>
        )}

        {!smiles && !loading && !error && (
          <div className="cg-empty">
            <div className="cg-empty-icon">⬡</div>
            <p>
              Hit <strong>Generate</strong> to synthesise
              <br />a novel molecule structure
            </p>
          </div>
        )}

        <footer className="cg-footer">
          POWERED BY AI · HuggingFace Space
        </footer>
      </div>
    </div>
  );
}

export default App;