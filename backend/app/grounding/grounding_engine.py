from dataclasses import dataclass

from app.grounding.claim_verifier import (
    ClaimVerifier,
    VerificationResult,
)


@dataclass
class GroundingResult:
    overall_score: float
    contradiction_score: float
    unknown_score: float
    verifications: list[VerificationResult]


class GroundingEngine:

    def __init__(self, verifier: ClaimVerifier):
        self.verifier = verifier

    def verify_claims(
        self,
        claims: list[str],
    ) -> GroundingResult:

        if not claims:
            return GroundingResult(
                overall_score=1.0,
                contradiction_score=0.0,
                unknown_score=0.0,
                verifications=[],
            )

        results = [
            self.verifier.verify(claim)
            for claim in claims
        ]

        score_map = {
            "SUPPORTED": 1.0,
            "UNKNOWN": 0.5,
            "CONTRADICTED": 0.0,
        }

        grounding_scores = [
            score_map[result.status]
            for result in results
        ]

        overall_score = round(
            sum(grounding_scores) / len(grounding_scores),
            2,
        )

        contradictions = sum(
            result.status == "CONTRADICTED"
            for result in results
        )

        unknowns = sum(
            result.status == "UNKNOWN"
            for result in results
        )

        contradiction_score = round(
            contradictions / len(results),
            2,
        )

        unknown_score = round(
            unknowns / len(results),
            2,
        )

        return GroundingResult(
            overall_score=overall_score,
            contradiction_score=contradiction_score,
            unknown_score=unknown_score,
            verifications=results,
        )