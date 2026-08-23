from dataclasses import dataclass


@dataclass(frozen=True)
class ApplicationPolicy:

    name: str
    description: str

    workflow_criticality: float
    user_impact: float
    regulatory_exposure: float
    data_sensitivity: float
    actionability: float

    verify_threshold: float
    review_threshold: float
    block_threshold: float

    critical_pii_threshold: float
    financial_claim_threshold: float

    critical_pii_action: str
    financial_claim_action: str


FINANCIAL_DECISION = ApplicationPolicy(
    name="financial_decision",
    description="AI used in consequential financial workflows.",

    workflow_criticality=0.95,
    user_impact=0.90,
    regulatory_exposure=0.90,
    data_sensitivity=0.60,
    actionability=0.95,

    verify_threshold=0.35,
    review_threshold=0.60,
    block_threshold=0.80,

    critical_pii_threshold=0.80,
    financial_claim_threshold=0.40,

    critical_pii_action="BLOCK",
    financial_claim_action="HUMAN_REVIEW",
)


CUSTOMER_SUPPORT = ApplicationPolicy(
    name="customer_support",
    description="Customer-facing AI support assistant.",

    workflow_criticality=0.60,
    user_impact=0.70,
    regulatory_exposure=0.50,
    data_sensitivity=0.80,
    actionability=0.60,

    verify_threshold=0.30,
    review_threshold=0.65,
    block_threshold=0.85,

    critical_pii_threshold=0.80,
    financial_claim_threshold=0.60,

    critical_pii_action="BLOCK",
    financial_claim_action="VERIFY",
)


INTERNAL_KNOWLEDGE = ApplicationPolicy(
    name="internal_knowledge",
    description="Internal employee knowledge assistant.",

    workflow_criticality=0.35,
    user_impact=0.40,
    regulatory_exposure=0.30,
    data_sensitivity=0.50,
    actionability=0.30,

    verify_threshold=0.40,
    review_threshold=0.70,
    block_threshold=0.90,

    critical_pii_threshold=0.90,
    financial_claim_threshold=0.70,

    critical_pii_action="BLOCK",
    financial_claim_action="VERIFY",
)