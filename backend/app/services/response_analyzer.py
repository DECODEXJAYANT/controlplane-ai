from dataclasses import dataclass

from app.detectors.pii_detector import PIIDetector
from app.detectors.policy_detector import PolicyDetector
from app.detectors.claim_detector import ClaimDetector


@dataclass
class ResponseAnalysis:
    pii_score: float
    claim_score: float
    policy_score: float

    pii_entities: list[str]
    policy_violations: list[str]
    claims: list[str]

    overall_risk_signal: float


class ResponseAnalyzer:

    def __init__(self):
        self.pii_detector = PIIDetector()
        self.policy_detector = PolicyDetector()
        self.claim_detector = ClaimDetector()

    def analyze(self, response: str) -> ResponseAnalysis:

        pii = self.pii_detector.detect(response)
        policy = self.policy_detector.detect(response)
        claims = self.claim_detector.detect(response)

        overall_risk_signal = round(
            pii.score * 0.40
            + claims.score * 0.35
            + policy.score * 0.25,
            2,
        )

        return ResponseAnalysis(
            pii_score=pii.score,
            claim_score=claims.score,
            policy_score=policy.score,
            pii_entities=pii.entities,
            policy_violations=policy.violations,
            claims=claims.claims,
            overall_risk_signal=overall_risk_signal,
        )