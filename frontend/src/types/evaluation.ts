export type DecisionAction =
  | "ALLOW"
  | "VERIFY"
  | "HUMAN_REVIEW"
  | "BLOCK";

export interface Verification {
  claim: string;
  status: "SUPPORTED" | "UNKNOWN" | "CONTRADICTED";
  confidence: number;
  reason: string;
  evidence?: {
    id: string;
    product: string;
    category: string;
    facts: Record<string, unknown>;
  } | null;
}

export interface EvaluationResult {
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

    grounding: {
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
    action: DecisionAction;
    autonomy_score: number;
    reason: string;
  };
}
export interface ApplicationPolicy {
  name: string;
  description: string;

  consequence: {
    workflow_criticality: number;
    user_impact: number;
    regulatory_exposure: number;
    data_sensitivity: number;
    actionability: number;
  };

  thresholds: {
    verify: number;
    review: number;
    block: number;
  };

  critical_risks: {
    critical_pii_threshold: number;
    financial_claim_threshold: number;
    critical_pii_action: string;
    financial_claim_action: string;
  };
}

export interface PoliciesResponse {
  count: number;
  policies: ApplicationPolicy[];
}