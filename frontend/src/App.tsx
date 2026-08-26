import {
  Activity,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Settings,
} from "lucide-react";

import EvaluatePanel from "./components/evaluate/EvaluatePanel";

import "./App.css";

function App() {
  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <div className="brand-name">
              ControlPlane<span>.ai</span>
            </div>

            <div className="brand-subtitle">
              AI GOVERNANCE
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">

          <div className="nav-section">
            CONTROL
          </div>

          <button className="nav-item active">
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button className="nav-item">
            <ClipboardCheck size={18} />
            <span>Evaluate</span>
          </button>

          <button className="nav-item">
            <ShieldCheck size={18} />
            <span>Policies</span>
          </button>

          <div className="nav-section">
            OBSERVE
          </div>

          <button className="nav-item">
            <Activity size={18} />
            <span>Risk Monitor</span>
          </button>

          <button className="nav-item">
            <FileSearch size={18} />
            <span>Audit Log</span>
          </button>

          <div className="nav-section">
            SYSTEM
          </div>

          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>

        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />

          <div>
            <div className="status-title">
              Policy Engine Online
            </div>

            <div className="status-version">
              v0.1.0 · Local
            </div>
          </div>
        </div>

      </aside>

      {/* Main content */}
      <main className="main-content">

        <header className="topbar">

          <div>
            <div className="breadcrumb">
              CONTROL PLANE
              <span>/</span>
              OVERVIEW
            </div>
          </div>

          <div className="system-status">
            <span className="status-dot" />
            SYSTEM OPERATIONAL
          </div>

        </header>

        <section className="page-content">

          <div className="page-heading">

            <div>
              <p className="eyebrow">
                AI GOVERNANCE CONSOLE
              </p>

              <h1>
                ControlPlane
              </h1>

              <p className="page-description">
                Evaluate AI responses before they reach users,
                workflows, or downstream systems.
              </p>
            </div>

          </div>

          {/* Evaluation card */}
          <section className="evaluation-card">

            <div className="card-header">

              <div>
                <h2>
                  Evaluate AI Response
                </h2>

                <p>
                  Run a response through the ControlPlane
                  governance pipeline.
                </p>
              </div>

              <div className="pipeline-badge">
                <Activity size={15} />
                REAL-TIME EVALUATION
              </div>

            </div>

            {/* Actual evaluation workspace */}
            <div className="evaluation-workspace">
              <EvaluatePanel />
            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default App;