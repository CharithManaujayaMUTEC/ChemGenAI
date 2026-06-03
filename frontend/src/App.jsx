import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";
import "./App.css";

const TECH_STACK = [
  { label: "PyTorch", sub: "VAE Model", icon: "⬡" },
  { label: "RDKit", sub: "Validation", icon: "◈" },
  { label: "FastAPI", sub: "REST API", icon: "→" },
  { label: "React", sub: "Dashboard", icon: "◆" },
  { label: "Docker", sub: "MLOps", icon: "▣" },
  { label: "MLflow", sub: "Tracking", icon: "⊛" },
];

const PIPELINE = [
  { step: "01", title: "ZINC Dataset", desc: "20,000 molecular structures in SMILES format", color: "step-blue" },
  { step: "02", title: "VAE Training", desc: "LSTM-VAE learns latent chemical representations via PyTorch", color: "step-teal" },
  { step: "03", title: "Latent Sampling", desc: "Novel points sampled from the learned latent space", color: "step-teal" },
  { step: "04", title: "RDKit Validation", desc: "Generated SMILES verified for chemical validity", color: "step-blue" },
  { step: "05", title: "React Dashboard", desc: "Real-time rendering and interactive visualisation", color: "step-blue" },
];

const ABOUT_CARDS = [
  { icon: "◈", heading: "Problem", color: "card-coral", text: <>Drug discovery takes 10+ years and billions in investment. The drug-like chemical space contains an estimated 10<sup>60</sup>–10<sup>100</sup> molecules — impossible to explore manually.</> },
  { icon: "⬡", heading: "Approach", color: "card-teal", text: "A Variational Autoencoder (VAE) with LSTM layers is trained on 20,000 SMILES from the ZINC database, learning a continuous latent representation of chemical space." },
  { icon: "→", heading: "Generation", color: "card-blue", text: "Novel molecules are created by sampling latent vectors and decoding them into SMILES strings. RDKit verifies chemical validity of each output." },
  { icon: "◆", heading: "Future Work", color: "card-purple", text: "Lipinski's Rule of Five filtering, binding affinity estimation, toxicity prediction, RL-based optimisation, and GNN/Transformer architectures." },
];

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      o: Math.random() * 0.5 + 0.15,
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,220,150,${p.o})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,220,150,${0.07 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const ro = new ResizeObserver(() => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="cg-particles" aria-hidden="true" />;
}

function StatusPill({ valid }) {
  return (
    <div className={`cg-status-pill ${valid ? "pill-valid" : "pill-invalid"}`}>
      <span className="pill-dot" />
      <span>{valid ? "Valid structure" : "Invalid structure"}</span>
      <span className="pill-engine">RDKit</span>
    </div>
  );
}

export default function App() {
  const [smiles, setSmiles] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [genCount, setGenCount] = useState(0);

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
      setGenCount(c => c + 1);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "generate", label: "Generate", icon: "⬡" },
    { id: "pipeline", label: "Pipeline", icon: "→" },
    { id: "about", label: "About", icon: "◈" },
  ];

  return (
    <div className="cg-shell">
      <ParticleCanvas />

      {/* ── Sidebar ── */}
      <aside className="cg-sidebar">
        <div className="cg-sidebar-logo">
          <div className="cg-logo-mark">
            <div className="cg-hexagon" aria-hidden="true">⬡</div>
          </div>
          <div className="cg-logo-text">
            <span className="cg-brand">Chem<em>Gen</em>AI</span>
            <span className="cg-brand-sub">Molecular Platform</span>
          </div>
        </div>

        <nav className="cg-nav" role="navigation" aria-label="Main navigation">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`cg-nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
              {activeTab === t.id && <span className="nav-indicator" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <div className="cg-sidebar-stats">
          <div className="cg-stat-mini">
            <span className="stat-num">20K</span>
            <span className="stat-desc">Training molecules</span>
          </div>
          <div className="cg-stat-mini">
            <span className="stat-num">{genCount}</span>
            <span className="stat-desc">Generated this session</span>
          </div>
        </div>

        <div className="cg-sidebar-badges">
          <span className="cg-chip">VAE · LSTM</span>
          <span className="cg-chip cg-chip-green">v1.0 BETA</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cg-main" role="main">

        {/* ── Topbar ── */}
        <header className="cg-topbar">
          <div className="cg-topbar-left">
            <h1 className="cg-page-title">
              {activeTab === "generate" && "De Novo Generation"}
              {activeTab === "pipeline" && "ML Pipeline"}
              {activeTab === "about" && "About the Platform"}
            </h1>
            <p className="cg-page-sub">
              {activeTab === "generate" && "Sample novel molecules from learned latent chemical space"}
              {activeTab === "pipeline" && "End-to-end architecture from raw ZINC data to live API"}
              {activeTab === "about" && "Generative AI for early-stage drug discovery"}
            </p>
          </div>
          <div className="cg-topbar-right">
            <div className="cg-status-indicator">
              <span className="cg-live-dot" />
              <span>API live</span>
            </div>
            <div className="cg-dataset-badge">ZINC · 20K</div>
          </div>
        </header>

        {/* ══ GENERATE ══ */}
        {activeTab === "generate" && (
          <div className="cg-content">
            <div className="cg-generate-layout">
              <div className="cg-generate-left">
                <div className="cg-card cg-card-action">
                  <div className="cg-card-header">
                    <span className="cg-card-icon" aria-hidden="true">⬡</span>
                    <div>
                      <h2 className="cg-card-title">Latent Space Sampling</h2>
                      <p className="cg-card-desc">Each call samples a random point from the VAE's continuous latent representation and decodes it into a novel SMILES string.</p>
                    </div>
                  </div>

                  <button
                    className="cg-generate-btn"
                    onClick={generateMolecule}
                    disabled={loading}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <span className="btn-spinner" aria-hidden="true" />
                        <span>Synthesising…</span>
                      </>
                    ) : (
                      <>
                        <span className="btn-icon" aria-hidden="true">⬡</span>
                        <span>Generate Molecule</span>
                      </>
                    )}
                  </button>

                  {loading && (
                    <div className="cg-loading-bar" role="status" aria-label="Generating molecule">
                      <div className="cg-loading-track">
                        <div className="cg-loading-fill" />
                      </div>
                      <span className="cg-loading-label">Sampling from latent space</span>
                    </div>
                  )}
                </div>

                {/* SMILES result card */}
                {smiles && !loading && (
                  <div className="cg-card cg-card-result" role="region" aria-label="Generated molecule result">
                    <div className="cg-smiles-header">
                      <span className="cg-smiles-tag">SMILES</span>
                      <StatusPill valid={valid} />
                    </div>
                    <code className="cg-smiles-output">{smiles}</code>
                    <div className="cg-smiles-meta">
                      <span>Length: {smiles.length} chars</span>
                      <span>Generation #{genCount}</span>
                    </div>
                  </div>
                )}

                {error && !loading && (
                  <div className="cg-card cg-card-error" role="alert">
                    <span className="error-icon" aria-hidden="true">⚠</span>
                    <div>
                      <p className="error-title">Connection failed</p>
                      <p className="error-sub">Check your connection and try again.</p>
                    </div>
                  </div>
                )}

                {!smiles && !loading && !error && (
                  <div className="cg-empty-state" aria-label="No molecule generated yet">
                    <div className="empty-hex" aria-hidden="true">⬡</div>
                    <p>Hit <strong>Generate Molecule</strong> to sample a novel structure from the learned latent space.</p>
                  </div>
                )}
              </div>

              {/* Viewer panel */}
              <div className="cg-generate-right">
                <div className="cg-viewer-card">
                  <div className="cg-viewer-label">Structure Visualisation</div>
                  {smiles && !loading ? (
                    <div className="cg-viewer-wrap">
                      <MoleculeViewer smiles={smiles} />
                    </div>
                  ) : (
                    <div className="cg-viewer-placeholder" aria-hidden="true">
                      <div className="placeholder-ring" />
                      <div className="placeholder-ring r2" />
                      <div className="placeholder-dot" />
                    </div>
                  )}
                </div>

                <div className="cg-info-strip">
                  <div className="info-item">
                    <span className="info-label">Architecture</span>
                    <span className="info-val">VAE · LSTM</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Validation</span>
                    <span className="info-val">RDKit</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Chemical Space</span>
                    <span className="info-val">10<sup>60</sup>–10<sup>100</sup></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PIPELINE ══ */}
        {activeTab === "pipeline" && (
          <div className="cg-content">
            <div className="cg-pipeline-layout">
              <div className="cg-pipeline-steps" role="list" aria-label="Pipeline steps">
                {PIPELINE.map((item, i) => (
                  <div className={`cg-pipeline-row ${item.color}`} key={i} role="listitem">
                    <div className="pl-step-num">{item.step}</div>
                    <div className="pl-connector" aria-hidden="true">
                      {i < PIPELINE.length - 1 && <div className="pl-line" />}
                    </div>
                    <div className="pl-body">
                      <div className="pl-title">{item.title}</div>
                      <div className="pl-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cg-pipeline-aside">
                <div className="cg-api-card">
                  <div className="api-card-header">
                    <span className="api-method">POST</span>
                    <code className="api-endpoint">/generate</code>
                    <span className="api-status-ok">200</span>
                  </div>
                  <div className="api-body">
                    <div className="api-col">
                      <div className="api-col-label">Request</div>
                      <pre className="api-code">{`{
  "prompt":
    "Generate a molecule"
}`}</pre>
                    </div>
                    <div className="api-arrow" aria-hidden="true">→</div>
                    <div className="api-col">
                      <div className="api-col-label">Response</div>
                      <pre className="api-code">{`{
  "generated_smiles":
    "CCOc1ccc...",
  "valid": true
}`}</pre>
                    </div>
                  </div>
                </div>

                <div className="cg-tech-grid" role="list" aria-label="Technology stack">
                  {TECH_STACK.map((t, i) => (
                    <div className="cg-tech-tile" key={i} role="listitem">
                      <span className="tech-icon" aria-hidden="true">{t.icon}</span>
                      <span className="tech-label">{t.label}</span>
                      <span className="tech-sub">{t.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ABOUT ══ */}
        {activeTab === "about" && (
          <div className="cg-content">
            <div className="cg-about-layout">
              <div className="cg-about-grid" role="list" aria-label="Platform overview">
                {ABOUT_CARDS.map((c, i) => (
                  <div className={`cg-about-card ${c.color}`} key={i} role="listitem">
                    <div className="about-card-icon" aria-hidden="true">{c.icon}</div>
                    <h3 className="about-card-heading">{c.heading}</h3>
                    <p className="about-card-text">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="cg-academic-card">
                <div className="academic-label">Academic Context</div>
                <p className="academic-course">EC7203 — Advanced Artificial Intelligence</p>
                <p className="academic-dept">Department of Computer Engineering · University of Ruhuna</p>
                <div className="academic-tags">
                  <span>Drug Discovery</span>
                  <span>Generative AI</span>
                  <span>Cheminformatics</span>
                  <span>VAE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="cg-footer" role="contentinfo">
          <span>ChemGenAI · University of Ruhuna · EC7203</span>
          <span className="footer-dot" aria-hidden="true">·</span>
          <span>HuggingFace · Docker · MLflow</span>
        </footer>
      </main>
    </div>
  );
}