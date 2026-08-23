from dataclasses import dataclass


@dataclass
class RiskAssessment:
    hallucination: float
    unsupported_claim: float
    privacy: float
    bias: float
    safety: float
    policy_violation: float

    @property
    def overall_score(self) -> float:
        score = (
            self.hallucination * 0.20
            + self.unsupported_claim * 0.25
            + self.privacy * 0.20
            + self.bias * 0.10
            + self.safety * 0.15
            + self.policy_violation * 0.10
        )

        return round(score, 2)


class RiskEngine:

    def assess(
        self,
        hallucination: float = 0.0,
        unsupported_claim: float = 0.0,
        privacy: float = 0.0,
        bias: float = 0.0,
        safety: float = 0.0,
        policy_violation: float = 0.0,
    ) -> RiskAssessment:

        return RiskAssessment(
            hallucination=hallucination,
            unsupported_claim=unsupported_claim,
            privacy=privacy,
            bias=bias,
            safety=safety,
            policy_violation=policy_violation,
        )