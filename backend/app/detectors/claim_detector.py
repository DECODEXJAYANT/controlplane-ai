import re
from dataclasses import dataclass


@dataclass
class ClaimDetection:
    claims: list[str]
    score: float


class ClaimDetector:

    CLAIM_PATTERNS = [
        # Numeric claims such as 25%, 18.5%, etc.
        r"\b\d+(?:\.\d+)?%",

        # Strong assertion language.
        r"\b(?:guaranteed|guarantees|will|always|never)\b",

        # Eligibility / compliance claims.
        r"\b(?:approved|eligible|certified|compliant)\b",

        # Evidence / attribution claims.
        r"\b(?:according to|as per|based on)\b",
    ]

    def detect(self, text: str) -> ClaimDetection:

        # Split the response into sentences.
        sentences = re.split(
            r"(?<=[.!?])\s+",
            text.strip(),
        )

        claims = []

        for sentence in sentences:

            if not sentence.strip():
                continue

            # Determine whether this sentence contains
            # at least one claim indicator.
            is_claim = any(
                re.search(
                    pattern,
                    sentence,
                    re.IGNORECASE,
                )
                for pattern in self.CLAIM_PATTERNS
            )

            if is_claim:
                claims.append(sentence.strip())

        if not claims:
            return ClaimDetection(
                claims=[],
                score=0.0,
            )

        # Keep the scoring behavior approximately compatible
        # with the previous detector.
        score = min(
            1.0,
            0.25 + len(claims) * 0.10,
        )

        return ClaimDetection(
            claims=claims,
            score=round(score, 2),
        )