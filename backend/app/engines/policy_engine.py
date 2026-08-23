from dataclasses import dataclass


@dataclass
class AutonomyPolicy:
    allow_threshold: float
    verify_threshold: float
    review_threshold: float
    block_threshold: float


POLICIES = {
    "marketing": AutonomyPolicy(
        allow_threshold=0.30,
        verify_threshold=0.55,
        review_threshold=0.80,
        block_threshold=0.90,
    ),

    "internal_knowledge": AutonomyPolicy(
        allow_threshold=0.25,
        verify_threshold=0.50,
        review_threshold=0.75,
        block_threshold=0.90,
    ),

    "customer_support": AutonomyPolicy(
        allow_threshold=0.20,
        verify_threshold=0.45,
        review_threshold=0.70,
        block_threshold=0.85,
    ),

    "financial_decision": AutonomyPolicy(
        allow_threshold=0.15,
        verify_threshold=0.35,
        review_threshold=0.60,
        block_threshold=0.80,
    ),
}


class PolicyEngine:

    def get_policy(self, application: str) -> AutonomyPolicy:
        return POLICIES.get(
            application,
            POLICIES["internal_knowledge"],
        )