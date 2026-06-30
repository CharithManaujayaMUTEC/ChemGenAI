import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MoleculeViewer from "./components/MoleculeViewer";
import "./App.css";

const API = "https://charithmanujaya1-chemgenai.hf.space";

const PROMPTS = [
  "Generate a highly diverse aromatic drug candidate",
  "Generate a small organic molecule",
  "Generate a complex hydrophobic molecule",
  "Generate a stable molecule",
  "Generate a molecule",
];

const TECH_STACK = [
  { label: "PyTorch",    sub: "VAE Model",   icon: "⬡" },
  { label: "ChemBERTa",  sub: "Transformer", icon: "✦" },
  { label: "RDKit",      sub: "Validation",  icon: "◈" },
  { label: "FastAPI",    sub: "REST API",    icon: "→" },
  { label: "React",      sub: "Dashboard",   icon: "◆" },
  { label: "Docker",     sub: "MLOps",       icon: "▣" },
  { label: "MLflow",     sub: "Tracking",    icon: "⊛" },
  { label: "SQLAlchemy", sub: "Persistence", icon: "▤" },
];

const PIPELINE = [
  { step: "01", title: "User Prompt",        desc: "User enters or selects a natural-language generation prompt",                color: "step-blue" },
  { step: "02", title: "Prompt Interpretation", desc: "Prompt parsed into temperature, length, candidate count, and keywords",   color: "step-teal" },
  { step: "03", title: "LSTM-VAE Generator", desc: "Latent vectors sampled and decoded into up to 20 candidate SMILES",          color: "step-teal" },
  { step: "04", title: "RDKit Validation",   desc: "Each candidate verified for chemical validity",                              color: "step-blue" },
  { step: "05", title: "Property Calculation", desc: "Molecular weight, logP, TPSA, H-bond donors/acceptors, ring count, etc.",  color: "step-teal" },
  { step: "06", title: "Lipinski Rule of Five", desc: "Drug-likeness evaluated against Lipinski's Rule of Five",                 color: "step-teal" },
  { step: "07", title: "ChemBERTa Transformer", desc: "Each molecule encoded into a contextual Transformer embedding score",     color: "step-teal" },
  { step: "08", title: "Ranking & Scoring",  desc: "Candidates ranked by composite score and persisted via SQLAlchemy",          color: "step-blue" },
  { step: "09", title: "FastAPI REST API",   desc: "Results served through /generate and /history endpoints",                   color: "step-blue" },
  { step: "10", title: "React Dashboard",    desc: "Real-time rendering, ranking table, and interactive visualisation",         color: "step-blue" },
];

const ABOUT_CARDS = [
  { icon: "◈", heading: "Problem",     color: "card-coral",  text: "Drug discovery takes 10+ years and billions in investment. The drug-like chemical space contains an estimated 10⁶⁰–10¹⁰⁰ molecules — impossible to explore manually." },
  { icon: "⬡", heading: "Approach",    color: "card-teal",   text: "A Variational Autoencoder (VAE) with LSTM layers is trained on 20,000 SMILES from the ZINC database, learning a continuous latent representation of chemical space." },
  { icon: "✦", heading: "Transformer Analysis", color: "card-purple", text: "Each candidate is analysed by ChemBERTa, producing a contextual embedding score, while RDKit computes drug-likeness properties and Lipinski compliance." },
  { icon: "→", heading: "Batch Generation", color: "card-blue", text: "A single prompt yields up to 20 ranked candidates, each scored on validity, drug-likeness, and Transformer embedding magnitude." },
];

const TECHNIQUES = [
  { name: "Generative AI",      impl: "LSTM Variational Autoencoder" },
  { name: "Prompt Engineering", impl: "Natural-language prompt interpretation (temperature, length, keywords)" },
  { name: "Transformer Model",  impl: "ChemBERTa molecular encoder" },
  { name: "Cheminformatics",    impl: "RDKit property + Lipinski Rule of Five evaluation" },
  { name: "Deep Learning",      impl: "PyTorch" },
  { name: "MLOps",              impl: "MLflow + Docker + Hugging Face" },
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

function StatusPill({ valid, small }) {
  return (
    <div className={`cg-status-pill ${valid ? "pill-valid" : "pill-invalid"} ${small ? "pill-sm" : ""}`}>
      <span className="pill-dot" />
      <span>{valid ? "Valid" : "Invalid"}</span>
    </div>
  );
}

function fmt(n, d = 2) {
  return n === null || n === undefined || Number.isNaN(n) ? "—" : Number(n).toFixed(d);
}

export default function App() {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Generation response state
  const [genMeta, setGenMeta] = useState(null);       // { prompt, generated_at, interpreted_prompt }
  const [summary, setSummary] = useState(null);        // { generated, valid, drug_like, average_score }
  const [results, setResults] = useState([]);          // ranked molecule array
  const [selectedMol, setSelectedMol] = useState(null); // currently visualised molecule

  const [genCount, setGenCount] = useState(0);
  const [resultsView, setResultsView] = useState("list"); // list | gallery

  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histFilter, setHistFilter] = useState("all"); // all | valid | drug_like

  const generateMolecule = async () => {
    try {
      setLoading(true); setError(false);
      setResults([]); setSelectedMol(null); setSummary(null); setGenMeta(null);

      const res = await axios.post(`${API}/generate`, { prompt });
      const data = res.data;

      setGenMeta({
        prompt: data.prompt,
        generated_at: data.generated_at,
        interpreted_prompt: data.interpreted_prompt,
      });
      setSummary(data.summary);
      const resultList = data.results || [];
      setResults(resultList);
      const firstValid = resultList.find(m => m.valid) || resultList[0] || null;
      setSelectedMol(firstValid);
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
    generate: { title: "De Novo Generation", sub: "Generate and rank 20 candidate molecules per prompt" },
    pipeline: { title: "ML Pipeline",        sub: "Generative AI · Prompt Interpretation · Transformer Scoring" },
    history:  { title: "Generation History", sub: "Last 100 molecules with full property and Lipinski data" },
    about:    { title: "About the Platform", sub: "Generative AI for early-stage drug discovery — EC7203" },
  };

  const filteredHistory = history.filter(m => {
    if (histFilter === "valid") return m.valid;
    if (histFilter === "drug_like") return m.drug_like;
    return true;
  });

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
            <span className="stat-desc">Batches this session</span>
          </div>
        </div>

        <div className="cg-sidebar-badges">
          <span className="cg-chip">VAE · LSTM</span>
          <span className="cg-chip cg-chip-purple">ChemBERTa</span>
          <span className="cg-chip cg-chip-green">v2.1.0</span>
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

            <div className="cg-card cg-card-action" style={{ marginBottom: 16 }}>
              <div className="cg-card-header">
                <span className="cg-card-icon" aria-hidden="true">⬡</span>
                <div>
                  <h2 className="cg-card-title">Batch Candidate Generation</h2>
                  <p className="cg-card-desc">Each call interprets your prompt, samples up to 20 candidates from the LSTM-VAE latent space, validates with RDKit, scores Lipinski compliance, and ranks via ChemBERTa.</p>
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
                  ? <><span className="btn-spinner" aria-hidden="true" /><span>Synthesising 20 candidates…</span></>
                  : <><span className="btn-icon" aria-hidden="true">⬡</span><span>Generate Molecules</span></>}
              </button>

              {loading && (
                <div className="cg-loading-bar">
                  <div className="cg-loading-track"><div className="cg-loading-fill" /></div>
                  <span className="cg-loading-label">Sampling, validating, scoring…</span>
                </div>
              )}
            </div>

            {error && !loading && (
              <div className="cg-card cg-card-error" role="alert" style={{ marginBottom: 16 }}>
                <span className="error-icon" aria-hidden="true">⚠</span>
                <div>
                  <p className="error-title">Connection failed</p>
                  <p className="error-sub">Check your connection and try again.</p>
                </div>
              </div>
            )}

            {!results.length && !loading && !error && (
              <div className="cg-empty-state">
                <div className="empty-hex" aria-hidden="true">⬡</div>
                <p>Hit <strong>Generate Molecules</strong> to sample 20 ranked candidates from the learned latent space.</p>
              </div>
            )}

            {/* ── Summary + interpreted prompt ── */}
            {summary && !loading && (
              <div className="cg-summary-strip">
                <div className="summary-item"><span className="summary-val">{summary.generated}</span><span className="summary-label">Generated</span></div>
                <div className="summary-item"><span className="summary-val ok">{summary.valid}</span><span className="summary-label">Valid</span></div>
                <div className="summary-item"><span className="summary-val purple">{summary.drug_like}</span><span className="summary-label">Drug-like</span></div>
                <div className="summary-item"><span className="summary-val">{fmt(summary.average_score)}</span><span className="summary-label">Avg Score</span></div>
              </div>
            )}

            {genMeta && genMeta.interpreted_prompt && !loading && (
              <div className="cg-interp-card">
                <div className="cg-viewer-label">Interpreted Prompt</div>
                <div className="interp-body">
                  <div className="interp-row"><span>Temperature</span><span className="mono">{fmt(genMeta.interpreted_prompt.temperature)}</span></div>
                  <div className="interp-row"><span>Max Length</span><span className="mono">{genMeta.interpreted_prompt.max_length}</span></div>
                  <div className="interp-row"><span>Candidates</span><span className="mono">{genMeta.interpreted_prompt.num_candidates}</span></div>
                  <div className="interp-tags">
                    {(genMeta.interpreted_prompt.keywords || []).map(k => <span key={k} className="interp-tag">{k}</span>)}
                  </div>
                </div>
              </div>
            )}

            {/* ── Results layout: ranked list / gallery + viewer ── */}
            {results.length > 0 && !loading && (
              <>
                <div className="cg-view-toggle">
                  <button
                    className={`cg-view-btn ${resultsView === "list" ? "active" : ""}`}
                    onClick={() => setResultsView("list")}
                  >
                    ☰ List
                  </button>
                  <button
                    className={`cg-view-btn ${resultsView === "gallery" ? "active" : ""}`}
                    onClick={() => setResultsView("gallery")}
                  >
                    ▦ Gallery
                  </button>
                  <span className="cg-view-hint">{results.filter(m => m.valid).length} of {results.length} renderable</span>
                </div>

                {resultsView === "gallery" ? (
                  <div className="cg-gallery-grid" role="list">
                    {results.map((mol) => (
                      <button
                        key={mol.rank}
                        className={`cg-gallery-card ${selectedMol && selectedMol.rank === mol.rank ? "selected" : ""} ${!mol.valid ? "invalid" : ""}`}
                        onClick={() => setSelectedMol(mol)}
                        role="listitem"
                      >
                        <div className="gallery-thumb">
                          {mol.valid ? (
                            <MoleculeViewer smiles={mol.smiles} width={150} height={110} mini />
                          ) : (
                            <div className="mv-mini-error" aria-hidden="true">⚠</div>
                          )}
                        </div>
                        <div className="gallery-meta">
                          <span className="gallery-rank">#{mol.rank}</span>
                          <span className="gallery-score">{fmt(mol.score, 0)}</span>
                          {mol.lipinski?.drug_like && <span className="drug-like-badge" title="Lipinski compliant">RX</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="cg-results-layout">
                    <div className="cg-results-list" role="list">
                      {results.map((mol) => (
                        <button
                          key={mol.rank}
                          className={`cg-result-row ${selectedMol && selectedMol.rank === mol.rank ? "selected" : ""}`}
                          onClick={() => setSelectedMol(mol)}
                          role="listitem"
                        >
                          <span className="result-rank">#{mol.rank}</span>
                          {mol.valid ? (
                            <span className="result-thumb"><MoleculeViewer smiles={mol.smiles} width={56} height={42} mini /></span>
                          ) : (
                            <span className="result-thumb mv-mini-error" aria-hidden="true">⚠</span>
                          )}
                          <code className="result-smiles" title={mol.smiles}>{mol.smiles}</code>
                          <span className="result-score">{fmt(mol.score, 1)}</span>
                          <StatusPill valid={mol.valid} small />
                          {mol.lipinski && mol.lipinski.drug_like && <span className="drug-like-badge" title="Lipinski compliant">RX</span>}
                        </button>
                      ))}
                    </div>

                    <div className="cg-generate-right">
                  <div className="cg-viewer-card">
                    <div className="cg-viewer-label">
                      Structure Visualisation {selectedMol && <span className="viewer-rank">· Rank #{selectedMol.rank}</span>}
                    </div>
                    {selectedMol && selectedMol.valid ? (
                      <div className="cg-viewer-wrap"><MoleculeViewer smiles={selectedMol.smiles} /></div>
                    ) : selectedMol && !selectedMol.valid ? (
                      <div className="mv-error">
                        <span className="mv-error-icon" aria-hidden="true">⚠</span>
                        <p>This candidate failed RDKit validation.</p>
                        <p className="mv-error-sub">Invalid SMILES cannot be rendered. Pick a valid candidate from the list.</p>
                      </div>
                    ) : (
                      <div className="cg-viewer-placeholder">
                        <div className="placeholder-ring" />
                        <div className="placeholder-ring r2" />
                        <div className="placeholder-dot" />
                      </div>
                    )}
                  </div>

                  {selectedMol && (
                    <>
                      <div className="cg-analytics-card">
                        <div className="cg-viewer-label">Selected Candidate</div>
                        <div className="cg-analytics-body">
                          <div className="analytics-row"><span>SMILES</span><span className="mono" title={selectedMol.smiles}>{selectedMol.smiles.slice(0, 16)}…</span></div>
                          <div className="analytics-row"><span>Score</span><span className="mono">{fmt(selectedMol.score, 2)}</span></div>
                          <div className="analytics-row"><span>ChemBERTa Score</span><span className="mono purple-text">{fmt(selectedMol.chemberta_score, 2)}</span></div>
                          <div className="analytics-row"><span>Validity</span><span className={selectedMol.valid ? "ok" : "bad"}>{selectedMol.valid ? "Valid" : "Invalid"}</span></div>
                          <div className="analytics-row"><span>Drug-like</span><span className={selectedMol.lipinski?.drug_like ? "ok" : "bad"}>{selectedMol.lipinski?.drug_like ? "Yes" : "No"}</span></div>
                        </div>
                      </div>

                      {selectedMol.properties ? (
                        <div className="cg-info-strip">
                          <div className="info-item"><span className="info-label">Mol. Weight</span><span className="info-val">{fmt(selectedMol.properties.molecular_weight, 2)}</span></div>
                          <div className="info-item"><span className="info-label">logP</span><span className="info-val">{fmt(selectedMol.properties.logP, 2)}</span></div>
                          <div className="info-item"><span className="info-label">TPSA</span><span className="info-val">{fmt(selectedMol.properties.tpsa, 2)}</span></div>
                          <div className="info-item"><span className="info-label">H-bond Donors</span><span className="info-val">{selectedMol.properties.h_bond_donors}</span></div>
                          <div className="info-item"><span className="info-label">H-bond Acceptors</span><span className="info-val">{selectedMol.properties.h_bond_acceptors}</span></div>
                          <div className="info-item"><span className="info-label">Rotatable Bonds</span><span className="info-val">{selectedMol.properties.rotatable_bonds}</span></div>
                          <div className="info-item"><span className="info-label">Ring Count</span><span className="info-val">{selectedMol.properties.ring_count}</span></div>
                          <div className="info-item"><span className="info-label">Heavy Atoms</span><span className="info-val">{selectedMol.properties.heavy_atoms}</span></div>
                        </div>
                      ) : (
                        <div className="cg-info-strip">
                          <div className="info-item"><span className="info-label">Properties</span><span className="info-val">Unavailable (invalid molecule)</span></div>
                        </div>
                      )}

                      {selectedMol.lipinski && selectedMol.lipinski.violations && selectedMol.lipinski.violations.length > 0 && (
                        <div className="cg-violations-card">
                          <div className="cg-viewer-label">Lipinski Violations ({selectedMol.lipinski.violation_count})</div>
                          <div className="violations-list">
                            {selectedMol.lipinski.violations.map((v, i) => <span key={i} className="violation-chip">{v}</span>)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                    </div>
                  </div>
                )}
              </>
            )}
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
                      <pre className="api-code">{`{\n  "prompt":\n  "Generate a diverse\n   aromatic drug\n   candidate"\n}`}</pre>
                    </div>
                    <div className="api-arrow">→</div>
                    <div className="api-col">
                      <div className="api-col-label">Response</div>
                      <pre className="api-code">{`{\n  "summary": {\n    "generated": 20,\n    "valid": 18,\n    "drug_like": 15\n  },\n  "results": [ ... ]\n}`}</pre>
                    </div>
                  </div>
                  <div className="api-endpoints-row">
                    {["/ · GET", "/generate · POST", "/history · GET", "/health · GET", "/ping · GET"].map(ep => (
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
              <p className="cg-history-sub">Last 100 molecules stored via SQLAlchemy, with full property and Lipinski data.</p>
              <div className="cg-history-controls">
                <div className="cg-filter-group">
                  {["all", "valid", "drug_like"].map(f => (
                    <button
                      key={f}
                      className={`cg-filter-chip ${histFilter === f ? "active" : ""}`}
                      onClick={() => setHistFilter(f)}
                    >
                      {f === "all" ? "All" : f === "valid" ? "Valid" : "Drug-like"}
                    </button>
                  ))}
                </div>
                <button className="cg-refresh-btn" onClick={fetchHistory} disabled={histLoading}>
                  {histLoading ? <><span className="btn-spinner sm" />Refreshing…</> : <>↻ Refresh</>}
                </button>
              </div>
            </div>

            {histLoading && (
              <div className="cg-hist-loading">
                <div className="cg-spinner" />
                <span>Fetching history…</span>
              </div>
            )}

            {!histLoading && filteredHistory.length === 0 && (
              <div className="cg-empty-state">
                <div className="empty-hex">◉</div>
                <p>No history yet. Generate some molecules first.</p>
              </div>
            )}

            {!histLoading && filteredHistory.length > 0 && (
              <div className="cg-history-table-wrap">
                <table className="cg-history-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Molecule</th>
                      <th>Valid</th>
                      <th>Drug-like</th>
                      <th>Score</th>
                      <th>ChemBERTa</th>
                      <th>MW</th>
                      <th>logP</th>
                      <th>TPSA</th>
                      <th>Prompt</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((mol) => (
                      <tr key={mol.id}>
                        <td className="mono">{mol.id}</td>
                        <td className="mono cell-smiles" title={mol.smiles}>{mol.smiles}</td>
                        <td>
                          <span className={`hist-pill ${mol.valid ? "hist-valid" : "hist-invalid"}`}>
                            <span className="pill-dot" />{mol.valid ? "Valid" : "Invalid"}
                          </span>
                        </td>
                        <td>
                          <span className={`hist-pill ${mol.drug_like ? "hist-valid" : "hist-invalid"}`}>
                            <span className="pill-dot" />{mol.drug_like ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="mono">{fmt(mol.score, 1)}</td>
                        <td className="mono purple-text">{fmt(mol.chemberta_score, 2)}</td>
                        <td className="mono">{fmt(mol.molecular_weight, 1)}</td>
                        <td className="mono">{fmt(mol.logp, 2)}</td>
                        <td className="mono">{fmt(mol.tpsa, 1)}</td>
                        <td className="cell-prompt" title={mol.prompt}>{mol.prompt}</td>
                        <td className="mono cell-time">{new Date(mol.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
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
                  <span>Lipinski Rule of Five</span>
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
          <span>ChemGenAI v2.1.0 · University of Ruhuna · EC7203</span>
          <span className="footer-dot">·</span>
          <span>HuggingFace · Docker · MLflow · FastAPI · ChemBERTa</span>
        </footer>
      </main>
    </div>
  );
}