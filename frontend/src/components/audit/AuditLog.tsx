import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileSearch,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import "./AuditLog.css";

type GroundingVerification = {
  claim: string;
  status: string;
  confidence: number;
  reason: string;
  evidence?: unknown;
};

type AuditRecord = {
  id: number;
  timestamp: string;
  application: string;
  response: string;

  analysis: {
    overall_signal: number;
    critical_risks: string[];

    pii: {
      detected: boolean;
      entities: string[];
      score: number;
    };

    claims: {
      detected: boolean;
      claims: string[];
      score: number;
    };

    policy: {
      violations: string[];
      score: number;
    };

    grounding?: {
      overall_score: number;
      contradiction_score: number;
      unknown_score: number;
      verifications?: GroundingVerification[];
    };
  };

  risk: {
    overall_score: number;
    hallucination?: number;
    unsupported_claim?: number;
    privacy?: number;
    bias?: number;
    safety?: number;
    policy_violation?: number;
  };

  consequence: {
    overall_score: number;
    workflow_criticality?: number;
    user_impact?: number;
    regulatory_exposure?: number;
    data_sensitivity?: number;
    actionability?: number;
  };

  decision: {
    action: string;
    autonomy_score: number;
    reason: string;
  };
};

type AuditResponse = {
  count: number;
  records: AuditRecord[];
};

function AuditLog() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const loadAuditLog = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/audit"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load audit log: ${response.status}`
          );
        }

        const data: AuditResponse = await response.json();

        setRecords(data.records);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to connect to the ControlPlane audit service."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAuditLog();
  }, []);

  const formatApplication = (application: string) => {
    return application
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDecisionClass = (action: string) => {
    return action.toLowerCase().replaceAll("_", "-");
  };

  const formatRiskName = (risk: string) => {
    return risk
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatScore = (value?: number) => {
    return typeof value === "number"
      ? value.toFixed(2)
      : "—";
  };

  const renderEvidence = (evidence: unknown) => {
    if (!evidence) {
      return "No enterprise evidence available.";
    }

    if (typeof evidence === "string") {
      return evidence;
    }

    try {
      return JSON.stringify(evidence);
    } catch {
      return "Enterprise evidence available.";
    }
  };

  const toggleRecord = (id: number) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  return (
    <section className="audit-page">

      {/* HEADER */}
      <div className="audit-page-header">
        <div>
          <p className="eyebrow">
            GOVERNANCE HISTORY
          </p>

          <h1>Audit Log</h1>

          <p className="audit-description">
            Review historical AI evaluations,
            governance decisions, and risk signals.
          </p>
        </div>

        <div className="audit-count">
          <FileSearch size={18} />
          <span>{records.length} evaluations</span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="audit-state">
          <Loader2
            size={24}
            className="audit-spinner"
          />

          <p>
            Loading governance records...
          </p>
        </div>
      )}

      {/* ERROR */}
      {error && !loading && (
        <div className="audit-error">
          <AlertTriangle size={20} />

          <div>
            <strong>Audit service unavailable</strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        records.length === 0 && (
          <div className="audit-empty">
            <ShieldAlert size={32} />

            <h3>No audit records yet</h3>

            <p>
              Evaluate an AI response to create
              the first governance record.
            </p>
          </div>
        )}

      {/* TABLE */}
      {!loading &&
        !error &&
        records.length > 0 && (
          <div className="audit-table-wrapper">

            <table className="audit-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Application</th>
                  <th>Decision</th>
                  <th>Risk</th>
                  <th>Consequence</th>
                  <th>Autonomy</th>
                  <th>Grounding</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>

                {records.map((record) => {
                  const isExpanded =
                    expandedId === record.id;

                  return (
                    <>
                      {/* MAIN ROW */}
                      <tr
                        key={`record-${record.id}`}
                        className={`audit-record-row ${
                          isExpanded
                            ? "audit-record-row-expanded"
                            : ""
                        }`}
                        onClick={() =>
                          toggleRecord(record.id)
                        }
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            toggleRecord(record.id);
                          }
                        }}
                      >

                        <td>
                          <div className="record-id-cell">
                            <span className="record-id">
                              #{record.id}
                            </span>

                            {isExpanded ? (
                              <ChevronUp size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="application-name">
                            {formatApplication(
                              record.application
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`decision-badge ${getDecisionClass(
                              record.decision.action
                            )}`}
                          >
                            {record.decision.action}
                          </span>
                        </td>

                        <td>
                          <span className="score-value">
                            {record.risk.overall_score.toFixed(
                              2
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="score-value">
                            {record.consequence.overall_score.toFixed(
                              2
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="score-value">
                            {record.decision.autonomy_score.toFixed(
                              2
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="score-value">
                            {record.analysis.grounding
                              ? record.analysis.grounding.overall_score.toFixed(
                                  2
                                )
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <span className="timestamp">
                            {formatTimestamp(
                              record.timestamp
                            )}
                          </span>
                        </td>

                      </tr>

                      {/* DETAIL ROW */}
                      {isExpanded && (
                        <tr
                          key={`details-${record.id}`}
                          className="audit-detail-row"
                        >
                          <td colSpan={8}>

                            <div className="audit-detail-panel">

                              {/* DETAIL HEADER */}
                              <div className="audit-detail-header">

                                <div>
                                  <p className="eyebrow">
                                    GOVERNANCE RECORD #{record.id}
                                  </p>

                                  <h2>
                                    {formatApplication(
                                      record.application
                                    )}
                                  </h2>

                                  <p>
                                    {formatTimestamp(
                                      record.timestamp
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  className="audit-detail-close"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setExpandedId(null);
                                  }}
                                >
                                  <XCircle size={18} />
                                  Close
                                </button>

                              </div>

                              {/* DECISION */}
                              <div
                                className={`audit-decision-panel ${getDecisionClass(
                                  record.decision.action
                                )}`}
                              >

                                <div className="audit-decision-icon">
                                  {record.decision.action ===
                                  "BLOCK" ? (
                                    <XCircle size={24} />
                                  ) : (
                                    <ShieldCheck size={24} />
                                  )}
                                </div>

                                <div className="audit-decision-content">
                                  <span>
                                    GOVERNANCE DECISION
                                  </span>

                                  <strong>
                                    {record.decision.action}
                                  </strong>

                                  <p>
                                    {record.decision.reason}
                                  </p>
                                </div>

                                <div className="audit-autonomy">
                                  <span>
                                    AUTONOMY
                                  </span>

                                  <strong>
                                    {formatScore(
                                      record.decision
                                        .autonomy_score
                                    )}
                                  </strong>
                                </div>

                              </div>

                              {/* SCORE CARDS */}
                              <div className="audit-detail-grid">

                                <div className="audit-detail-card">
                                  <span>RISK</span>
                                  <strong>
                                    {formatScore(
                                      record.risk
                                        .overall_score
                                    )}
                                  </strong>
                                  <small>
                                    AI response risk
                                  </small>
                                </div>

                                <div className="audit-detail-card">
                                  <span>CONSEQUENCE</span>
                                  <strong>
                                    {formatScore(
                                      record.consequence
                                        .overall_score
                                    )}
                                  </strong>
                                  <small>
                                    Application impact
                                  </small>
                                </div>

                                <div className="audit-detail-card">
                                  <span>GROUNDING</span>
                                  <strong>
                                    {formatScore(
                                      record.analysis
                                        .grounding
                                        ?.overall_score
                                    )}
                                  </strong>
                                  <small>
                                    Enterprise verification
                                  </small>
                                </div>

                              </div>

                              {/* AI RESPONSE */}
                              <div className="audit-detail-section">

                                <p className="eyebrow">
                                  AI RESPONSE
                                </p>

                                <h3>
                                  Evaluated Response
                                </h3>

                                <div className="audit-response-box">
                                  {record.response}
                                </div>

                              </div>

                              {/* CRITICAL RISKS */}
                              <div className="audit-detail-section">

                                <p className="eyebrow">
                                  CONTROL SIGNALS
                                </p>

                                <h3>
                                  Critical Risks
                                </h3>

                                {record.analysis
                                  .critical_risks
                                  .length > 0 ? (
                                  <div className="audit-risk-list">

                                    {record.analysis.critical_risks.map(
                                      (risk) => (
                                        <div
                                          className="audit-risk-item"
                                          key={risk}
                                        >
                                          <AlertTriangle
                                            size={17}
                                          />

                                          <span>
                                            {formatRiskName(
                                              risk
                                            )}
                                          </span>
                                        </div>
                                      )
                                    )}

                                  </div>
                                ) : (
                                  <div className="audit-safe-message">
                                    <ShieldCheck
                                      size={18}
                                    />
                                    No critical risks
                                    detected.
                                  </div>
                                )}

                              </div>

                              {/* RESPONSE ANALYSIS */}
                              <div className="audit-detail-section">

                                <p className="eyebrow">
                                  DETECTORS
                                </p>

                                <h3>
                                  Response Analysis
                                </h3>

                                <div className="audit-analysis-grid">

                                  <div className="audit-metric">
                                    <span>
                                      Privacy / PII
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.risk.privacy
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Unsupported Claims
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.risk
                                          .unsupported_claim
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Policy Violation
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.risk
                                          .policy_violation
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Hallucination
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.risk
                                          .hallucination
                                      )}
                                    </strong>
                                  </div>

                                </div>

                                {/* PII */}
                                {record.analysis.pii.detected && (
                                  <div className="audit-subsection">

                                    <span className="audit-subsection-title">
                                      PII ENTITIES
                                    </span>

                                    <div className="audit-tags">
                                      {record.analysis.pii.entities.map(
                                        (entity) => (
                                          <span
                                            key={entity}
                                            className="audit-tag danger"
                                          >
                                            {entity}
                                          </span>
                                        )
                                      )}
                                    </div>

                                  </div>
                                )}

                                {/* CLAIMS */}
                                {record.analysis.claims.detected && (
                                  <div className="audit-subsection">

                                    <span className="audit-subsection-title">
                                      DETECTED CLAIMS
                                    </span>

                                    {record.analysis.claims.claims.map(
                                      (claim, index) => (
                                        <div
                                          className="audit-claim"
                                          key={`${claim}-${index}`}
                                        >
                                          {claim}
                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                                {/* POLICY */}
                                {record.analysis.policy
                                  .violations.length > 0 && (
                                  <div className="audit-subsection">

                                    <span className="audit-subsection-title">
                                      POLICY VIOLATIONS
                                    </span>

                                    <div className="audit-tags">
                                      {record.analysis.policy.violations.map(
                                        (violation) => (
                                          <span
                                            key={violation}
                                            className="audit-tag warning"
                                          >
                                            {formatRiskName(
                                              violation
                                            )}
                                          </span>
                                        )
                                      )}
                                    </div>

                                  </div>
                                )}

                              </div>

                              {/* CONSEQUENCE */}
                              <div className="audit-detail-section">

                                <p className="eyebrow">
                                  APPLICATION PROFILE
                                </p>

                                <h3>
                                  Consequence Profile
                                </h3>

                                <div className="audit-analysis-grid">

                                  <div className="audit-metric">
                                    <span>
                                      Workflow Criticality
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.consequence
                                          .workflow_criticality
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      User Impact
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.consequence
                                          .user_impact
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Regulatory Exposure
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.consequence
                                          .regulatory_exposure
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Data Sensitivity
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.consequence
                                          .data_sensitivity
                                      )}
                                    </strong>
                                  </div>

                                  <div className="audit-metric">
                                    <span>
                                      Actionability
                                    </span>

                                    <strong>
                                      {formatScore(
                                        record.consequence
                                          .actionability
                                      )}
                                    </strong>
                                  </div>

                                </div>

                              </div>

                              {/* GROUNDING */}
                              {record.analysis.grounding && (
                                <div className="audit-detail-section">

                                  <p className="eyebrow">
                                    ENTERPRISE GROUNDING
                                  </p>

                                  <h3>
                                    Claim Verification
                                  </h3>

                                  <div className="audit-analysis-grid">

                                    <div className="audit-metric">
                                      <span>
                                        Contradiction
                                      </span>

                                      <strong>
                                        {formatScore(
                                          record.analysis
                                            .grounding
                                            .contradiction_score
                                        )}
                                      </strong>
                                    </div>

                                    <div className="audit-metric">
                                      <span>
                                        Unknown
                                      </span>

                                      <strong>
                                        {formatScore(
                                          record.analysis
                                            .grounding
                                            .unknown_score
                                        )}
                                      </strong>
                                    </div>

                                    <div className="audit-metric">
                                      <span>
                                        Overall Grounding
                                      </span>

                                      <strong>
                                        {formatScore(
                                          record.analysis
                                            .grounding
                                            .overall_score
                                        )}
                                      </strong>
                                    </div>

                                  </div>

                                  {record.analysis.grounding
                                    .verifications &&
                                    record.analysis.grounding
                                      .verifications.length >
                                      0 && (
                                      <div className="audit-verifications">

                                        {record.analysis.grounding.verifications.map(
                                          (
                                            verification,
                                            index
                                          ) => (
                                            <div
                                              className="audit-verification"
                                              key={`${verification.claim}-${index}`}
                                            >

                                              <div className="verification-header">

                                                <span
                                                  className={`verification-status ${verification.status.toLowerCase()}`}
                                                >
                                                  {
                                                    verification.status
                                                  }
                                                </span>

                                                <span>
                                                  Confidence{" "}
                                                  {Math.round(
                                                    verification.confidence *
                                                      100
                                                  )}
                                                  %
                                                </span>

                                              </div>

                                              <p className="verification-claim">
                                                {
                                                  verification.claim
                                                }
                                              </p>

                                              <p className="verification-reason">
                                                {
                                                  verification.reason
                                                }
                                              </p>

                                              <div className="verification-evidence">

                                                <span>
                                                  ENTERPRISE
                                                  EVIDENCE
                                                </span>

                                                <p>
                                                  {renderEvidence(
                                                    verification.evidence
                                                  )}
                                                </p>

                                              </div>

                                            </div>
                                          )
                                        )}

                                      </div>
                                    )}

                                </div>
                              )}

                            </div>

                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      {/* SUMMARY */}
      {!loading &&
        !error &&
        records.length > 0 && (
          <div className="audit-summary">

            <div className="summary-card">
              <span>Total Evaluations</span>

              <strong>
                {records.length}
              </strong>
            </div>

            <div className="summary-card">
              <span>Blocked</span>

              <strong>
                {
                  records.filter(
                    (record) =>
                      record.decision.action ===
                      "BLOCK"
                  ).length
                }
              </strong>
            </div>

            <div className="summary-card">
              <span>Human Review</span>

              <strong>
                {
                  records.filter(
                    (record) =>
                      record.decision.action ===
                      "HUMAN_REVIEW"
                  ).length
                }
              </strong>
            </div>

            <div className="summary-card">
              <span>Verified / Allowed</span>

              <strong>
                {
                  records.filter(
                    (record) =>
                      record.decision.action ===
                        "VERIFY" ||
                      record.decision.action ===
                        "ALLOW"
                  ).length
                }
              </strong>
            </div>

          </div>
        )}

    </section>
  );
}

export default AuditLog;