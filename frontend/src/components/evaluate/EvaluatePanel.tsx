import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type EvidenceFacts = {
  guaranteed_return?: boolean;
  maximum_return_percentage?: number;
  premium_eligibility_required?: boolean;
};

type EnterpriseEvidence = {
  id?: string;
  product?: string;
  category?: string;
  facts?: EvidenceFacts;
};

type Verification = {
  claim: string;
  status: string;
  confidence: number;
  reason: string;
  evidence?: EnterpriseEvidence | null;
};

type EvaluationResult = {
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
      verifications: Verification[];
    };
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
    workflow_criticality: number;
    user_impact: number;
    regulatory_exposure: number;
    data_sensitivity: number;
    actionability: number;
  };

  decision: {
    action: string;
    autonomy_score: number;
    reason: string;
  };
};

function EvaluatePanel() {
  const [application, setApplication] =
    useState("financial_decision");

  const [response, setResponse] = useState("");

  const [result, setResult] =
    useState<EvaluationResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const evaluateResponse = async () => {
    if (!response.trim()) {
      setError("Please enter an AI response.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiResponse = await fetch(
        "http://127.0.0.1:8000/api/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            application,
            response,
          }),
        }
      );

      if (!apiResponse.ok) {
        throw new Error(
          `API request failed: ${apiResponse.status}`
        );
      }

      const data: EvaluationResult =
        await apiResponse.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to ControlPlane backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getDecisionIcon = () => {
    if (!result) return null;

    if (result.decision.action === "BLOCK") {
      return <XCircle size={22} />;
    }

    if (result.decision.action === "HUMAN_REVIEW") {
      return <AlertTriangle size={22} />;
    }

    return <CheckCircle2 size={22} />;
  };

  return (
    <div className="evaluate-panel">

      {/* ===================================================== */}
      {/* INPUT SECTION */}
      {/* ===================================================== */}

      <div className="evaluation-inputs">

        {/* Application */}
        <div className="form-group">

          <label htmlFor="application">
            Application
          </label>

          <select
            id="application"
            value={application}
            onChange={(event) =>
              setApplication(event.target.value)
            }
          >
            <option value="financial_decision">
              Financial Decision
            </option>

            <option value="customer_support">
              Customer Support
            </option>

            <option value="internal_knowledge">
              Internal Knowledge
            </option>
          </select>

        </div>

        {/* AI Response */}
        <div className="form-group">

          <div className="textarea-header">

            <label htmlFor="response">
              AI Response
            </label>

            <span>
              {response.length} characters
            </span>

          </div>

          <textarea
            id="response"
            value={response}
            onChange={(event) =>
              setResponse(event.target.value)
            }
            placeholder="Paste an AI-generated response here..."
            rows={8}
          />

        </div>

        {/* Evaluate Button */}
        <button
          className="evaluate-button"
          onClick={evaluateResponse}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2
                size={17}
                className="spin"
              />

              Evaluating...
            </>
          ) : (
            <>
              <ShieldCheck size={17} />

              Evaluate Response
            </>
          )}
        </button>

      </div>

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <div className="evaluation-error">

          <AlertTriangle size={17} />

          <span>{error}</span>

        </div>
      )}

      {/* ===================================================== */}
      {/* RESULTS */}
      {/* ===================================================== */}

      {result && (
        <div className="evaluation-results">

          {/* ================================================= */}
          {/* GOVERNANCE DECISION */}
          {/* ================================================= */}

          <section
            className={`decision-card ${result.decision.action.toLowerCase()}`}
          >

            <div className="decision-icon">
              {getDecisionIcon()}
            </div>

            <div className="decision-content">

              <span className="section-eyebrow">
                GOVERNANCE DECISION
              </span>

              <h2>
                {result.decision.action}
              </h2>

              <p>
                {result.decision.reason}
              </p>

            </div>

            <div className="autonomy-score">

              <span>
                Autonomy
              </span>

              <strong>
                {result.decision.autonomy_score.toFixed(2)}
              </strong>

            </div>

          </section>

          {/* ================================================= */}
          {/* SCORE CARDS */}
          {/* ================================================= */}

          <div className="score-grid">

            {/* Risk */}
            <div className="score-card">

              <div className="score-header">

                <span>
                  RISK
                </span>

                <strong>
                  {result.risk.overall_score.toFixed(2)}
                </strong>

              </div>

              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${result.risk.overall_score * 100}%`,
                  }}
                />
              </div>

              <p>
                AI response risk
              </p>

            </div>

            {/* Consequence */}
            <div className="score-card">

              <div className="score-header">

                <span>
                  CONSEQUENCE
                </span>

                <strong>
                  {result.consequence.overall_score.toFixed(2)}
                </strong>

              </div>

              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${result.consequence.overall_score * 100}%`,
                  }}
                />
              </div>

              <p>
                Application impact
              </p>

            </div>

            {/* Signal */}
            <div className="score-card">

              <div className="score-header">

                <span>
                  SIGNAL
                </span>

                <strong>
                  {result.analysis.overall_signal.toFixed(2)}
                </strong>

              </div>

              <div className="score-bar">
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${result.analysis.overall_signal * 100}%`,
                  }}
                />
              </div>

              <p>
                Detector signal
              </p>

            </div>

          </div>

          {/* ================================================= */}
          {/* CRITICAL RISKS */}
          {/* ================================================= */}

          <section className="result-card critical-risks-card">

            <span className="section-eyebrow">
              CONTROL SIGNALS
            </span>

            <h3>
              Critical Risks
            </h3>

            {result.analysis.critical_risks.length === 0 ? (

              <div className="no-risk">
                <CheckCircle2 size={17} />
                No critical risks detected.
              </div>

            ) : (

              <div className="risk-list">

                {result.analysis.critical_risks.map(
                  (risk) => (

                    <div
                      key={risk}
                      className="risk-tag"
                    >
                      <AlertTriangle size={16} />

                      {risk.replaceAll("_", " ")}

                    </div>

                  )
                )}

              </div>

            )}

          </section>

          {/* ================================================= */}
          {/* ANALYSIS + CONSEQUENCE */}
          {/* ================================================= */}

          <div className="analysis-grid">

            {/* Response Analysis */}
            <section className="result-card">

              <span className="section-eyebrow">
                DETECTORS
              </span>

              <h3>
                Response Analysis
              </h3>

              <div className="metric-list">

                <MetricRow
                  label="Privacy / PII"
                  value={result.risk.privacy}
                />

                <MetricRow
                  label="Unsupported Claims"
                  value={result.risk.unsupported_claim}
                />

                <MetricRow
                  label="Policy Violation"
                  value={result.risk.policy_violation}
                />

              </div>

              {/* PII Entities */}
              {result.analysis.pii.entities.length > 0 && (

                <div className="tag-section">

                  <span>
                    PII ENTITIES
                  </span>

                  <div className="tag-list">

                    {result.analysis.pii.entities.map(
                      (entity) => (

                        <span
                          className="small-tag"
                          key={entity}
                        >
                          {entity}
                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

              {/* Policy Violations */}
              {result.analysis.policy.violations.length > 0 && (

                <div className="tag-section">

                  <span>
                    POLICY VIOLATIONS
                  </span>

                  <div className="tag-list">

                    {result.analysis.policy.violations.map(
                      (violation) => (

                        <span
                          className="policy-tag"
                          key={violation}
                        >
                          {violation}
                        </span>

                      )
                    )}

                  </div>

                </div>

              )}

            </section>

            {/* Consequence Profile */}
            <section className="result-card">

              <span className="section-eyebrow">
                APPLICATION PROFILE
              </span>

              <h3>
                Consequence Profile
              </h3>

              <p className="application-name">
                {result.application
                  .replaceAll("_", " ")
                  .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                  )}
              </p>

              <div className="metric-list">

                <MetricRow
                  label="Workflow Criticality"
                  value={
                    result.consequence.workflow_criticality
                  }
                />

                <MetricRow
                  label="User Impact"
                  value={
                    result.consequence.user_impact
                  }
                />

                <MetricRow
                  label="Regulatory Exposure"
                  value={
                    result.consequence.regulatory_exposure
                  }
                />

                <MetricRow
                  label="Data Sensitivity"
                  value={
                    result.consequence.data_sensitivity
                  }
                />

                <MetricRow
                  label="Actionability"
                  value={
                    result.consequence.actionability
                  }
                />

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* ENTERPRISE GROUNDING */}
          {/* ================================================= */}

          {result.analysis.grounding && (

            <section className="result-card grounding-card">

              <div className="grounding-header">

                <div>

                  <span className="section-eyebrow">
                    ENTERPRISE GROUNDING
                  </span>

                  <h3>
                    Claim Verification
                  </h3>

                </div>

                <div className="grounding-score">
                  {result.analysis.grounding.overall_score.toFixed(
                    2
                  )}
                </div>

              </div>

              {/* Grounding Summary */}
              <div className="grounding-summary">

                <div className="grounding-stat">

                  <span>
                    CONTRADICTED
                  </span>

                  <strong>
                    {
                      result.analysis.grounding
                        .contradiction_score
                    }
                  </strong>

                </div>

                <div className="grounding-stat">

                  <span>
                    UNKNOWN
                  </span>

                  <strong>
                    {
                      result.analysis.grounding
                        .unknown_score
                    }
                  </strong>

                </div>

              </div>

              {/* ================================================= */}
              {/* VERIFICATIONS */}
              {/* ================================================= */}

              <div className="verification-list">

                {result.analysis.grounding.verifications.map(
                  (verification, index) => (

                    <div
                      key={index}
                      className="grounding-verification"
                    >

                      {/* Verification Header */}
                      <div className="verification-header">

                        <div
                          className={`verification-status ${verification.status.toLowerCase()}`}
                        >
                          {verification.status}
                        </div>

                        <span className="verification-confidence">
                          Confidence{" "}
                          {Math.round(
                            verification.confidence * 100
                          )}
                          %
                        </span>

                      </div>

                      {/* Claim */}
                      <p className="verification-claim">
                        {verification.claim}
                      </p>

                      {/* Reason */}
                      <p className="verification-reason">
                        {verification.reason}
                      </p>

                      {/* ================================================= */}
                      {/* ENTERPRISE EVIDENCE */}
                      {/* ================================================= */}

                      {verification.evidence && (

                        <div className="enterprise-evidence">

                          <div className="evidence-header">

                            <div>

                              <span className="section-eyebrow">
                                ENTERPRISE EVIDENCE
                              </span>

                              <h4>
                                {verification.evidence.product ??
                                  "Enterprise Record"}
                              </h4>

                            </div>

                            <span className="evidence-category">
                              {verification.evidence.category ??
                                "enterprise"}
                            </span>

                          </div>

                          {/* Evidence Facts */}
                          {verification.evidence.facts && (

                            <div className="evidence-facts">

                              <div className="evidence-fact">

                                <span>
                                  Guaranteed Return
                                </span>

                                <strong>
                                  {verification.evidence.facts
                                    .guaranteed_return
                                    ? "YES"
                                    : "NO"}
                                </strong>

                              </div>

                              <div className="evidence-fact">

                                <span>
                                  Maximum Return
                                </span>

                                <strong>
                                  {verification.evidence.facts
                                    .maximum_return_percentage !==
                                  undefined
                                    ? `${verification.evidence.facts.maximum_return_percentage}%`
                                    : "N/A"}
                                </strong>

                              </div>

                              <div className="evidence-fact">

                                <span>
                                  Premium Eligibility
                                </span>

                                <strong>
                                  {verification.evidence.facts
                                    .premium_eligibility_required
                                    ? "REQUIRED"
                                    : "NOT REQUIRED"}
                                </strong>

                              </div>

                            </div>

                          )}

                          {/* Evidence Source */}
                          <div className="evidence-source">

                            <span>
                              Source
                            </span>

                            <strong>
                              Enterprise Knowledge Base
                            </strong>

                          </div>

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            </section>

          )}

        </div>
      )}

    </div>
  );
}


/* ========================================================= */
/* METRIC ROW COMPONENT */
/* ========================================================= */

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="metric-row">

      <span>
        {label}
      </span>

      <div className="metric-bar">
        <div
          className="metric-bar-fill"
          style={{
            width: `${value * 100}%`,
          }}
        />
      </div>

      <strong>
        {value.toFixed(2)}
      </strong>

    </div>
  );
}

export default EvaluatePanel;