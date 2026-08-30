import re
from dataclasses import dataclass


@dataclass
class ClaimDetection:
    claims: list[str]
    score: float


class ClaimDetector:

    CLAIM_PATTERNS = [

        # ---------------------------------------------------------
        # Numeric / financial claims
        # ---------------------------------------------------------
        r"\b\d+(?:\.\d+)?%",

        r"\$\s?\d+(?:,\d{3})*(?:\.\d+)?",

        # ---------------------------------------------------------
        # Strong guarantee / certainty language
        # ---------------------------------------------------------
        r"\b(?:guaranteed|guarantees|guarantee)\b",

        r"\b(?:always|never)\b",

        # ---------------------------------------------------------
        # Eligibility / compliance claims
        # ---------------------------------------------------------
        r"\b(?:approved|eligible|qualify|qualifies|qualified|certified|compliant)\b",

        # ---------------------------------------------------------
        # Evidence / attribution claims
        # ---------------------------------------------------------
        r"\b(?:according to|as per|based on)\b",

        # ---------------------------------------------------------
        # Financial outcome claims
        # ---------------------------------------------------------
        r"\b(?:return|returns|profit|profits|interest rate|yield)\b",

        # ---------------------------------------------------------
        # Strong outcome assertions
        #
        # Avoid generic "will" because normal workflow language
        # such as "we will review your application" is not itself
        # a high-risk claim.
        # ---------------------------------------------------------
        r"\b(?:will|can)\s+(?:receive|earn|get|generate|provide|pay|save)\b",
    ]

    def detect(self, text: str) -> ClaimDetection:

        # Split response into sentences.
        sentences = re.split(
            r"(?<=[.!?])\s+",
            text.strip(),
        )

        claims = []

        for sentence in sentences:

            if not sentence.strip():
                continue

            # Determine whether this sentence contains
            # at least one meaningful claim indicator.
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

        # Keep scoring behavior compatible with the
        # existing detector.
        score = min(
            1.0,
            0.25 + len(claims) * 0.10,
        )

        return ClaimDetection(
            claims=claims,
            score=round(score, 2),
        )