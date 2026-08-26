import { useState } from "react";
import {
  Activity,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  ShieldCheck,
  Settings,
} from "lucide-react";

import EvaluatePanel from "./components/evaluate/EvaluatePanel";
import AuditLog from "./components/audit/AuditLog";

import "./App.css";

type Page =
  | "overview"
  | "evaluate"
  | "policies"
  | "risk"
  | "audit"
  | "settings";

function App() {
  const [activePage, setActivePage] =
    useState<Page>("overview");

  const renderPage = () => {
    switch (activePage) {
      case "evaluate":
        return <EvaluatePanel />;

      case "audit":
        return <AuditLog />;

      case "overview":
        return (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">
                  AI GOVERNANCE CONSOLE
                </p>

                <h1>
                  ControlPlane
                </h1>

                <p className="page-description">
                  Evaluate AI responses before they reach
                  users, workflows, or downstream systems.
                </p>
              </div>
            </div>

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

              <EvaluatePanel />
            </section>
          </>
        );

      case "policies":
        return (
          <div className="page-placeholder">
            <p className="eyebrow">
              CONTROL
            </p>

            <h1>Policies</h1>

            <p>
              Application governance policies will appear
              here.
            </p>
          </div>
        );

      case "risk":
        return (
          <div className="page-placeholder">
            <p className="eyebrow">
              OBSERVE
            </p>

            <h1>Risk Monitor</h1>

            <p>
              Risk monitoring dashboard will appear here.
            </p>
          </div>
        );

      case "settings":
        return (
          <div className="page-placeholder">
            <p className="eyebrow">
              SYSTEM
            </p>

            <h1>Settings</h1>

            <p>
              ControlPlane configuration will appear here.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

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

          <button
            className={`nav-item ${
              activePage === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("overview")
            }
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "evaluate"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("evaluate")
            }
          >
            <ClipboardCheck size={18} />
            <span>Evaluate</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "policies"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("policies")
            }
          >
            <ShieldCheck size={18} />
            <span>Policies</span>
          </button>

          <div className="nav-section">
            OBSERVE
          </div>

          <button
            className={`nav-item ${
              activePage === "risk"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("risk")
            }
          >
            <Activity size={18} />
            <span>Risk Monitor</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "audit"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("audit")
            }
          >
            <FileSearch size={18} />
            <span>Audit Log</span>
          </button>

          <div className="nav-section">
            SYSTEM
          </div>

          <button
            className={`nav-item ${
              activePage === "settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("settings")
            }
          >
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
              {activePage.toUpperCase()}
            </div>
          </div>

          <div className="system-status">
            <span className="status-dot" />
            SYSTEM OPERATIONAL
          </div>

        </header>

        <section className="page-content">
          {renderPage()}
        </section>

      </main>

    </div>
  );
}

export default App;