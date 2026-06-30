import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";
import "./App.css";

const API = "https://charithmanujaya1-chemgenai.hf.space";

const PROMPTS = [
  "Generate a molecule",
  "Generate a stable molecule",
  "Generate a diverse molecule",
  "Generate a complex molecule",
  "Generate a small molecule",
];

const TECH_STACK = [
  { label: "PyTorch",   sub: "VAE Model",     icon: "⬡" },
  { label: "ChemBERTa", sub: "Transformer",   icon: "✦" },
  { label: "RDKit",     sub: "Validation",    icon: "◈" },
  { label: "FastAPI",   sub: "REST API",      icon: "→" },
  { label: "React",     sub: "Dashboard",     icon: "◆" },
  { label: "Docker",    sub: "MLOps",         icon: "▣" },
  { label: "MLflow",    sub: "Tracking",      icon: "⊛" },
  { label: "SQLAlchemy",sub: "Persistence",   icon: "▤" },
];

const PIPELINE = [
  { step: "01", title: "User Prompt",       desc: "User selects or enters a generation prompt",                              color: "step-blue" },
  { step: "02", title: "Prompt Engineering",desc: "Prompt parsed into generation parameters for the model",                  color: "step-teal" },
  { step: "03", title: "LSTM-VAE Generator",desc: "Latent vector sampled and decoded into a SMILES sequence via PyTorch",    color: "step-teal" },
  { step: "04", title: "RDKit Validation",  desc: "Generated SMILES verified for chemical validity",                        color: "step-blue" },
  { step: "05", title: "ChemBERTa Transformer", desc: "Molecule encoded into a contextual Transformer embedding",           color: "step-teal" },
  { step: "06", title: "SQLite Database",   desc: "Result persisted with prompt, validity, and embedding norm via SQLAlchemy", color: "step-blue" },
  { step: "07", title: "FastAPI REST API",  desc: "Result served through /generate and /history endpoints",                 color: "step-blue" },
  { step: "08", title: "React Dashboard",   desc: "Real-time rendering and interactive visualisation",                      color: "step-blue" },
];

const ABOUT_CARDS = [
  { icon: "◈", heading: "Problem",     color: "card-coral",  text: "Drug discovery takes 10+ years and billions in investment. The drug-like chemical space contains an estimated 10⁶⁰–10¹⁰⁰ molecules — impossible to explore manually." },
  { icon: "⬡", heading: "Approach",    color: "card-teal",   text: "A Variational Autoencoder (VAE) with LSTM layers is trained on 20,000 SMILES from the ZINC database, learning a continuous latent representation of chemical space." },
  { icon: "✦", heading: "Transformer Analysis", color: "card-purple", text: "Generated molecules are analysed by ChemBERTa, producing a contextual Transformer embedding describing the encoded molecular representation." },
  { icon: "→", heading: "Generation",  color: "card-blue",   text: "Novel molecules are created by sampling latent vectors and decoding them into SMILES strings. RDKit verifies chemical validity of each output." },
];

const TECHNIQUES = [
  { name: "Generative AI",       impl: "LSTM Variational Autoencoder" },
  { name: "Prompt Engineering",  impl: "Prompt-controlled generation parameters" },
  { name: "Transformer Model",   impl: "ChemBERTa molecular encoder" },
  { name: "Deep Learning",       impl: "PyTorch" },
  { name: "MLOps",               impl: "MLflow + Docker + Hugging Face" },
];

/* ── Animated particle background ── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let W, H, raf;
    const resize = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
    resize();
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.4,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.45 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,220,150,${p.o})`; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,220,150,${0.07*(1-d/100)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(resize); ro.observe(c);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} className="cg-particles" aria-hidden="true" />;
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
  const [smiles, setSmiles]   = useState("");
  const [valid, setValid]     = useState(false);
  const [embeddingNorm, setEmbeddingNorm] = useState(null);
  const [prompt, setPrompt]   = useState(PROMPTS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [genCount, setGenCount]   = useState(0);
  const [history, setHistory]     = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState(null);
  const [dbId, setDbId] = useState(null);

  const generateMolecule = async () => {
    try {
      setLoading(true); setError(false); setSmiles("");
      const res = await axios.post(`${API}/generate`, { prompt });
      setSmiles(res.data.generated_smiles);
      setValid(res.data.valid);
      setEmbeddingNorm(
        res.data.chemberta_embedding_norm ??
        res.data.chemberta_embedding_magnitude ??
        res.data.chemberta_score ??
        null
      );
      setCreatedAt(new Date().toISOString());
      setDbId(res.data.id ?? null);
      setGenCount(c => c + 1);
    } catch (e) {
      console.error(e); setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistLoading(true);
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  const tabs = [
    { id: "generate", label: "Generate", icon: "⬡" },
    { id: "pipeline", label: "Pipeline", icon: "→" },
    { id: "history",  label: "History",  icon: "◉" },
    { id: "about",    label: "About",    icon: "◈" },
  ];

  const pageMeta = {
    generate: { title: "De Novo Generation", sub: "Prompt-driven molecule sampling with Transformer analysis" },
    pipeline: { title: "ML Pipeline",        sub: "Generative AI · Prompt Engineering · Transformer Model" },
    history:  { title: "Generation History", sub: "Last 50 molecules generated via the FastAPI backend" },
    about:    { title: "About the Platform", sub: "Generative AI for early-stage drug discovery — EC7203" },
  };

  const fmtNorm = (n) => (n === null || n === undefined ? "—" : Number(n).toFixed(3));

  return (
    <div className="cg-shell">
      <ParticleCanvas />

      {sidebarOpen && <div className="cg-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`cg-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="cg-sidebar-logo">
          <div className="cg-logo-mark">
            <span className="cg-hexagon" aria-hidden="true">⬡</span>
          </div>
          <div className="cg-logo-text">
            <span className="cg-brand">Chem<em>Gen</em>AI</span>
            <span className="cg-brand-sub">Molecular Platform</span>
          </div>
        </div>

        <nav className="cg-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`cg-nav-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
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
          <span className="cg-chip cg-chip-purple">ChemBERTa</span>
          <span className="cg-chip cg-chip-green">v2.0</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cg-main">

        <header className="cg-topbar">
          <button className="cg-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
          <div className="cg-topbar-left">
            <h1 className="cg-page-title">{pageMeta[activeTab].title}</h1>
            <p className="cg-page-sub">{pageMeta[activeTab].sub}</p>
          </div>
          <div className="cg-topbar-right">
            <div className="cg-live-badge"><span className="cg-live-dot" />API live</div>
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
                      <p className="cg-card-desc">Select a prompt to control generation parameters. The LSTM-VAE samples a latent vector and decodes it into a novel SMILES string, then ChemBERTa derives a Transformer embedding from the result.</p>
                    </div>
                  </div>

                  <div className="cg-prompt-select">
                    <label className="cg-prompt-label" htmlFor="prompt-select">PROMPT</label>
                    <select
                      id="prompt-select"
                      className="cg-select"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={loading}
                    >
                      {PROMPTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <button className="cg-generate-btn" onClick={generateMolecule} disabled={loading} aria-busy={loading}>
                    {loading
                      ? <><span className="btn-spinner" aria-hidden="true" /><span>Synthesising…</span></>
                      : <><span className="btn-icon" aria-hidden="true">⬡</span><span>Generate Molecule</span></>}
                  </button>

                  {loading && (
                    <div className="cg-loading-bar" role="status">
                      <div className="cg-loading-track"><div className="cg-loading-fill" /></div>
                      <span className="cg-loading-label">Sampling from latent space</span>
                    </div>
                  )}
                </div>

                {smiles && !loading && (
                  <div className="cg-card cg-card-result" role="region" aria-label="Generated molecule result">
                    <div className="cg-smiles-header">
                      <span className="cg-smiles-tag">SMILES</span>
                      <StatusPill valid={valid} />
                    </div>
                    <code className="cg-smiles-output">{smiles}</code>

                    <div className="cg-chemberta-row">
                      <span className="cg-chemberta-icon" aria-hidden="true">✦</span>
                      <div>
                        <div className="cg-chemberta-label">ChemBERTa Embedding Norm</div>
                        <div className="cg-chemberta-value">{fmtNorm(embeddingNorm)}</div>
                      </div>
                    </div>

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
                  <div className="cg-empty-state">
                    <div className="empty-hex" aria-hidden="true">⬡</div>
                    <p>Hit <strong>Generate Molecule</strong> to sample a novel structure from the learned latent space.</p>
                  </div>
                )}
              </div>

              <div className="cg-generate-right">
                <div className="cg-viewer-card">
                  <div className="cg-viewer-label">Structure Visualisation</div>
                  {smiles && !loading
                    ? <div className="cg-viewer-wrap"><MoleculeViewer smiles={smiles} /></div>
                    : (
                      <div className="cg-viewer-placeholder" aria-hidden="true">
                        <div className="placeholder-ring" />
                        <div className="placeholder-ring r2" />
                        <div className="placeholder-dot" />
                      </div>
                    )}
                </div>

                {/* Analytics card */}
                <div className="cg-analytics-card">
                  <div className="cg-viewer-label">Analytics</div>
                  <div className="cg-analytics-body">
                    <div className="analytics-row"><span>Generated Molecule</span><span className="mono">{smiles ? `${smiles.slice(0, 14)}…` : "—"}</span></div>
                    <div className="analytics-row"><span>Validity</span><span className={valid ? "ok" : "bad"}>{smiles ? (valid ? "Valid" : "Invalid") : "—"}</span></div>
                    <div className="analytics-row"><span>ChemBERTa Embedding Norm</span><span className="mono">{fmtNorm(embeddingNorm)}</span></div>
                    <div className="analytics-row"><span>Generated Time</span><span className="mono">{createdAt ? new Date(createdAt).toLocaleTimeString() : "—"}</span></div>
                    <div className="analytics-row"><span>Database ID</span><span className="mono">{dbId ?? "—"}</span></div>
                  </div>
                </div>

                <div className="cg-info-strip">
                  <div className="info-item"><span className="info-label">Architecture</span><span className="info-val">VAE · LSTM</span></div>
                  <div className="info-item"><span className="info-label">Validation</span><span className="info-val">RDKit</span></div>
                  <div className="info-item"><span className="info-label">Embedding</span><span className="info-val">ChemBERTa</span></div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ══ PIPELINE ══ */}
        {activeTab === "pipeline" && (
          <div className="cg-content">
            <div className="cg-pipeline-layout">
              <div className="cg-pipeline-steps" role="list">
                {PIPELINE.map((item, i) => (
                  <div className={`cg-pipeline-row ${item.color}`} key={i} role="listitem">
                    <div className="pl-step-num">{item.step}</div>
                    <div className="pl-connector">
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
                      <pre className="api-code">{`{\n  "prompt":\n  "Generate a molecule"\n}`}</pre>
                    </div>
                    <div className="api-arrow">→</div>
                    <div className="api-col">
                      <div className="api-col-label">Response</div>
                      <pre className="api-code">{`{\n  "generated_smiles":\n  "CCOc1ccc...",\n  "valid": true,\n  "chemberta_embedding_norm":\n  27.416\n}`}</pre>
                    </div>
                  </div>
                  <div className="api-endpoints-row">
                    {["/generate · POST", "/history · GET", "/health · GET", "/ping · GET"].map(ep => (
                      <span className="api-ep-chip" key={ep}>{ep}</span>
                    ))}
                  </div>
                </div>

                <div className="cg-technique-card">
                  <div className="cg-viewer-label">Advanced AI Techniques</div>
                  <div className="cg-technique-list">
                    {TECHNIQUES.map(t => (
                      <div className="technique-row" key={t.name}>
                        <span className="technique-name">{t.name}</span>
                        <span className="technique-impl">{t.impl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cg-tech-grid" role="list">
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

        {/* ══ HISTORY ══ */}
        {activeTab === "history" && (
          <div className="cg-content">
            <div className="cg-history-header">
              <p className="cg-history-sub">Last 50 molecules stored in the SQLite backend via SQLAlchemy, including Transformer outputs.</p>
              <button className="cg-refresh-btn" onClick={fetchHistory} disabled={histLoading}>
                {histLoading ? <><span className="btn-spinner sm" />Refreshing…</> : <>↻ Refresh</>}
              </button>
            </div>

            {histLoading && (
              <div className="cg-hist-loading">
                <div className="cg-spinner" />
                <span>Fetching history…</span>
              </div>
            )}

            {!histLoading && history.length === 0 && (
              <div className="cg-empty-state">
                <div className="empty-hex">◉</div>
                <p>No history yet. Generate some molecules first.</p>
              </div>
            )}

            {!histLoading && history.length > 0 && (
              <div className="cg-history-table-wrap">
                <table className="cg-history-table">
                  <thead>
                    <tr>
                      <th>Molecule</th>
                      <th>Valid</th>
                      <th>Prompt</th>
                      <th>ChemBERTa</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((mol) => {
                      const norm = mol.chemberta_embedding_norm ?? mol.chemberta_embedding_magnitude ?? mol.chemberta_score ?? null;
                      return (
                        <tr key={mol.id}>
                          <td className="mono cell-smiles" title={mol.smiles}>{mol.smiles}</td>
                          <td>
                            <span className={`hist-pill ${mol.valid ? "hist-valid" : "hist-invalid"}`}>
                              <span className="pill-dot" />{mol.valid ? "Valid" : "Invalid"}
                            </span>
                          </td>
                          <td className="cell-prompt">{mol.prompt}</td>
                          <td className="mono">{fmtNorm(norm)}</td>
                          <td className="mono cell-time">{new Date(mol.created_at).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ ABOUT ══ */}
        {activeTab === "about" && (
          <div className="cg-content">
            <div className="cg-about-layout">
              <div className="cg-about-grid" role="list">
                {ABOUT_CARDS.map((c, i) => (
                  <div className={`cg-about-card ${c.color}`} key={i} role="listitem">
                    <div className="about-card-icon" aria-hidden="true">{c.icon}</div>
                    <h3 className="about-card-heading">{c.heading}</h3>
                    <p className="about-card-text">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="cg-technique-card">
                <div className="cg-viewer-label">Advanced AI Techniques</div>
                <div className="cg-technique-list">
                  {TECHNIQUES.map(t => (
                    <div className="technique-row" key={t.name}>
                      <span className="technique-name">{t.name}</span>
                      <span className="technique-impl">{t.impl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cg-academic-card">
                <div className="academic-label">Academic Context</div>
                <p className="academic-course">EC7203 — Advanced Artificial Intelligence</p>
                <p className="academic-dept">Department of Computer Engineering · University of Ruhuna</p>
                <div className="academic-tags">
                  <span>Drug Discovery</span>
                  <span>Generative AI</span>
                  <span>Prompt Engineering</span>
                  <span>Transformer</span>
                  <span>ChemBERTa</span>
                  <span>Cheminformatics</span>
                  <span>VAE</span>
                  <span>SMILES</span>
                  <span>RDKit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="cg-footer">
          <span>ChemGenAI · University of Ruhuna · EC7203</span>
          <span className="footer-dot">·</span>
          <span>HuggingFace · Docker · MLflow · FastAPI · ChemBERTa</span>
        </footer>
      </main>
    </div>
  );
}