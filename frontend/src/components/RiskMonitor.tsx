import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface AuditRecord {
  id: number;
  timestamp: string;
  application: string;

  analysis: {
    critical_risks: string[];
  };

  risk: {
    overall_score: number;
    hallucination: number;
    unsupported_claim: number;
    privacy: number;
    bias: number;
    safety: number;
    policy_violation: number;
  };

  consequence: {
    overall_score: number;
  };

  decision: {
    action: "ALLOW" | "VERIFY" | "HUMAN_REVIEW" | "BLOCK";
    autonomy_score: number;
    reason: string;
  };
}

const API_BASE_URL = "http://127.0.0.1:8000";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function RiskMonitor() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/audit`
        );

        if (!response.ok) {
          throw new Error("Failed to load audit data.");
        }

        const data = await response.json();

        setRecords(data.records ?? []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to connect to the ControlPlane API.");
      } finally {
        setLoading(false);
      }
    }

    loadAudit();
  }, []);

  const stats = useMemo(() => {
    if (records.length === 0) {
      return {
        averageRisk: 0,
        averageAutonomy: 0,
        blocked: 0,
        review: 0,
        verify: 0,
        allowed: 0,
      };
    }

    const averageRisk =
      records.reduce(
        (sum, record) => sum + record.risk.overall_score,
        0
      ) / records.length;

    const averageAutonomy =
      records.reduce(
        (sum, record) =>
          sum + record.decision.autonomy_score,
        0
      ) / records.length;

    return {
      averageRisk,
      averageAutonomy,
      blocked: records.filter(
        (r) => r.decision.action === "BLOCK"
      ).length,
      review: records.filter(
        (r) => r.decision.action === "HUMAN_REVIEW"
      ).length,
      verify: records.filter(
        (r) => r.decision.action === "VERIFY"
      ).length,
      allowed: records.filter(
        (r) => r.decision.action === "ALLOW"
      ).length,
    };
  }, [records]);

  const riskDimensions = useMemo(() => {
    if (records.length === 0) {
      return [
        ["Hallucination", 0],
        ["Unsupported Claims", 0],
        ["Privacy", 0],
        ["Policy Violations", 0],
      ] as [string, number][];
    }

    const average = (key: keyof AuditRecord["risk"]) =>
      records.reduce(
        (sum, record) =>
          sum +
          (typeof record.risk[key] === "number"
            ? (record.risk[key] as number)
            : 0),
        0
      ) / records.length;

    return [
      ["Hallucination", average("hallucination")],
      ["Unsupported Claims", average("unsupported_claim")],
      ["Privacy", average("privacy")],
      ["Policy Violations", average("policy_violation")],
    ] as [string, number][];
  }, [records]);

  if (loading) {
    return (
      <div className="page-placeholder">
        <p className="eyebrow">OBSERVE</p>
        <h1>Risk Monitor</h1>
        <p>Loading governance telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-placeholder">
        <p className="eyebrow">OBSERVE</p>
        <h1>Risk Monitor</h1>

        <div className="monitor-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="risk-monitor">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OBSERVE</p>

          <h1>Risk Monitor</h1>

          <p className="page-description">
            Monitor AI risk, autonomy, and governance
            decisions across evaluated responses.
          </p>
        </div>

        <div className="pipeline-badge">
          <Activity size={15} />
          LIVE GOVERNANCE TELEMETRY
        </div>
      </div>

      {/* Summary cards */}
      <section className="monitor-grid">
        <div className="monitor-card">
          <div className="monitor-card-header">
            <span>Average Risk</span>
            <ShieldAlert size={18} />
          </div>

          <div className="monitor-value">
            {formatPercent(stats.averageRisk)}
          </div>

          <div className="monitor-subtext">
            Across {records.length} evaluation
            {records.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-header">
            <span>Average Autonomy</span>
            <Activity size={18} />
          </div>

          <div className="monitor-value">
            {formatPercent(stats.averageAutonomy)}
          </div>

          <div className="monitor-subtext">
            Lower values indicate stronger governance
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-header">
            <span>Human Review</span>
            <UserCheck size={18} />
          </div>

          <div className="monitor-value">
            {stats.review}
          </div>

          <div className="monitor-subtext">
            Escalated evaluations
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-header">
            <span>Blocked</span>
            <ShieldAlert size={18} />
          </div>

          <div className="monitor-value">
            {stats.blocked}
          </div>

          <div className="monitor-subtext">
            Prevented from autonomous execution
          </div>
        </div>
      </section>

      {/* Decision distribution */}
      <section className="monitor-section">
        <div className="monitor-section-header">
          <div>
            <p className="eyebrow">GOVERNANCE OUTCOMES</p>
            <h2>Decision Distribution</h2>
          </div>

          <span className="monitor-count">
            {records.length} evaluations
          </span>
        </div>

        <div className="decision-grid">
          <div className="decision-stat">
            <CheckCircle2 size={18} />
            <span>ALLOW</span>
            <strong>{stats.allowed}</strong>
          </div>

          <div className="decision-stat">
            <ShieldCheck size={18} />
            <span>VERIFY</span>
            <strong>{stats.verify}</strong>
          </div>

          <div className="decision-stat">
            <UserCheck size={18} />
            <span>HUMAN REVIEW</span>
            <strong>{stats.review}</strong>
          </div>

          <div className="decision-stat">
            <ShieldAlert size={18} />
            <span>BLOCK</span>
            <strong>{stats.blocked}</strong>
          </div>
        </div>
      </section>

      {/* Risk dimensions */}
      <section className="monitor-section">
        <div className="monitor-section-header">
          <div>
            <p className="eyebrow">RISK SIGNALS</p>
            <h2>Risk Dimensions</h2>
          </div>
        </div>

        <div className="risk-dimensions">
          {riskDimensions.map(([label, value]) => (
            <div className="risk-dimension" key={label}>
              <div className="risk-dimension-header">
                <span>{label}</span>
                <strong>{formatPercent(value)}</strong>
              </div>

              <div className="risk-bar">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${Math.min(value * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent evaluations */}
      <section className="monitor-section">
        <div className="monitor-section-header">
          <div>
            <p className="eyebrow">RECENT ACTIVITY</p>
            <h2>Recent Evaluations</h2>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-monitor">
            <Activity size={22} />
            <p>No evaluations recorded yet.</p>
          </div>
        ) : (
          <div className="evaluation-table">
            <div className="evaluation-table-header">
              <span>Application</span>
              <span>Risk</span>
              <span>Autonomy</span>
              <span>Decision</span>
              <span>Time</span>
            </div>

            {records
              .slice()
              .reverse()
              .slice(0, 10)
              .map((record) => (
                <div
                  className="evaluation-table-row"
                  key={record.id}
                >
                  <span className="application-name">
                    {record.application}
                  </span>

                  <span>
                    {formatPercent(
                      record.risk.overall_score
                    )}
                  </span>

                  <span>
                    {formatPercent(
                      record.decision.autonomy_score
                    )}
                  </span>

                  <span>
                    <span
                      className={`decision-pill decision-${record.decision.action.toLowerCase()}`}
                    >
                      {record.decision.action}
                    </span>
                  </span>

                  <span className="evaluation-time">
                    {new Date(
                      record.timestamp
                    ).toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default RiskMonitor;