import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { getPolicies } from "../../api/controlplane";
import type {
  ApplicationPolicy,
  PoliciesResponse,
} from "../../types/evaluation";

import "./PoliciesPanel.css";


function formatPolicyName(name: string) {
  return name
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}


function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}


function consequenceLabel(value: number) {
  if (value >= 0.8) return "HIGH";
  if (value >= 0.5) return "MEDIUM";
  return "LOW";
}


function PolicyCard({
  policy,
}: {
  policy: ApplicationPolicy;
}) {
  const consequenceMetrics = [
    {
      label: "Workflow Criticality",
      value: policy.consequence.workflow_criticality,
    },
    {
      label: "User Impact",
      value: policy.consequence.user_impact,
    },
    {
      label: "Regulatory Exposure",
      value: policy.consequence.regulatory_exposure,
    },
    {
      label: "Data Sensitivity",
      value: policy.consequence.data_sensitivity,
    },
    {
      label: "Actionability",
      value: policy.consequence.actionability,
    },
  ];

  return (
    <article className="policy-card">

      <div className="policy-card-header">

        <div className="policy-title-row">
          <div className="policy-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2>
              {formatPolicyName(policy.name)}
            </h2>

            <p>
              {policy.description}
            </p>
          </div>
        </div>

        <div className="policy-status">
          <CheckCircle2 size={14} />
          ACTIVE
        </div>

      </div>


      {/* Consequence profile */}
      <section className="policy-section">

        <div className="policy-section-heading">
          <div>
            <p className="policy-eyebrow">
              CONSEQUENCE PROFILE
            </p>

            <h3>
              Workflow Sensitivity
            </h3>
          </div>
        </div>

        <div className="metric-grid">

          {consequenceMetrics.map((metric) => (
            <div
              className="policy-metric"
              key={metric.label}
            >
              <div className="metric-top">
                <span>
                  {metric.label}
                </span>

                <strong>
                  {percentage(metric.value)}
                </strong>
              </div>

              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: percentage(metric.value),
                  }}
                />
              </div>

              <span className="metric-level">
                {consequenceLabel(metric.value)}
              </span>
            </div>
          ))}

        </div>

      </section>


      {/* Decision thresholds */}
      <section className="policy-section">

        <div className="policy-section-heading">
          <div>
            <p className="policy-eyebrow">
              DECISION THRESHOLDS
            </p>

            <h3>
              Governance Escalation
            </h3>
          </div>
        </div>

        <div className="threshold-grid">

          <div className="threshold-item">
            <FileCheck2 size={17} />

            <div>
              <span>Verify</span>
              <strong>
                {percentage(policy.thresholds.verify)}
              </strong>
            </div>
          </div>

          <div className="threshold-item">
            <UserCheck size={17} />

            <div>
              <span>Human Review</span>
              <strong>
                {percentage(policy.thresholds.review)}
              </strong>
            </div>
          </div>

          <div className="threshold-item">
            <Ban size={17} />

            <div>
              <span>Block</span>
              <strong>
                {percentage(policy.thresholds.block)}
              </strong>
            </div>
          </div>

        </div>

      </section>


      {/* Critical risks */}
      <section className="policy-section">

        <div className="policy-section-heading">
          <div>
            <p className="policy-eyebrow">
              CRITICAL-RISK CONTROLS
            </p>

            <h3>
              Override Conditions
            </h3>
          </div>
        </div>

        <div className="risk-control-grid">

          <div className="risk-control">

            <div className="risk-control-icon">
              <AlertTriangle size={17} />
            </div>

            <div className="risk-control-content">
              <span>
                Critical PII Threshold
              </span>

              <strong>
                {percentage(
                  policy.critical_risks
                    .critical_pii_threshold
                )}
              </strong>

              <small>
                Action:{" "}
                {policy.critical_risks
                  .critical_pii_action}
              </small>
            </div>

          </div>


          <div className="risk-control">

            <div className="risk-control-icon">
              <AlertTriangle size={17} />
            </div>

            <div className="risk-control-content">
              <span>
                Financial Claim Threshold
              </span>

              <strong>
                {percentage(
                  policy.critical_risks
                    .financial_claim_threshold
                )}
              </strong>

              <small>
                Action:{" "}
                {policy.critical_risks
                  .financial_claim_action}
              </small>
            </div>

          </div>

        </div>

      </section>

    </article>
  );
}


export default function PoliciesPanel() {

  const [data, setData] =
    useState<PoliciesResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadPolicies() {

      try {
        setLoading(true);

        const result = await getPolicies();

        setData(result);
        setError(null);

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load policies."
        );

      } finally {
        setLoading(false);
      }
    }

    loadPolicies();

  }, []);


  if (loading) {
    return (
      <div className="policies-state">
        <ShieldCheck size={22} />
        <span>
          Loading governance policies...
        </span>
      </div>
    );
  }


  if (error) {
    return (
      <div className="policies-state policies-error">
        <AlertTriangle size={22} />

        <div>
          <strong>
            Unable to load policies
          </strong>

          <span>
            {error}
          </span>
        </div>
      </div>
    );
  }


  if (!data || data.policies.length === 0) {
    return (
      <div className="policies-state">
        <ShieldCheck size={22} />

        <span>
          No application policies configured.
        </span>
      </div>
    );
  }


  return (
    <div className="policies-page">

      <div className="page-heading">

        <div>
          <p className="eyebrow">
            CONTROL
          </p>

          <h1>
            Policies
          </h1>

          <p className="page-description">
            Application-specific governance rules that
            determine how AI risk is handled.
          </p>
        </div>

        <div className="policy-count">
          <ShieldCheck size={16} />
          {data.count} active policies
        </div>

      </div>


      <div className="governance-flow">

        <div className="flow-step">
          <span>01</span>
          AI RESPONSE
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <span>02</span>
          RISK
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <span>03</span>
          CONSEQUENCE
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <span>04</span>
          POLICY
        </div>

        <div className="flow-line" />

        <div className="flow-step">
          <span>05</span>
          DECISION
        </div>

      </div>


      <div className="policies-list">

        {data.policies.map((policy) => (
          <PolicyCard
            key={policy.name}
            policy={policy}
          />
        ))}

      </div>

    </div>
  );
}