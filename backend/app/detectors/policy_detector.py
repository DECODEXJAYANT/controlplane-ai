import re
from dataclasses import dataclass


@dataclass
class PolicyDetection:
    violations: list[str]
    score: float


class PolicyDetector:

    HIGH_RISK_PATTERNS = {
        "guaranteed_return": [
            r"\bguaranteed\s+(?:a\s+)?\d+(?:\.\d+)?%\s+return\b",
            r"\bguaranteed\s+return\b",
            r"\bguaranteed\s+profit\b",
        ],

        "risk_free_investment": [
            r"\brisk[-\s]?free\s+(?:investment|return|profit)\b",
        ],

        "compliance_bypass": [
            r"\bbypass\s+(?:verification|compliance|security)\b",
            r"\bignore\s+(?:compliance|security|verification)\b",
            r"\bdisable\s+security\b",
        ],

        "credential_sharing": [
            r"\bshare\s+(?:your\s+)?password\b",
            r"\bshare\s+(?:your\s+)?otp\b",
            r"\bshare\s+(?:your\s+)?credentials\b",
        ],
    }

    def detect(self, text: str) -> PolicyDetection:

        normalized_text = text.lower()

        violations = []

        for violation_type, patterns in self.HIGH_RISK_PATTERNS.items():

            for pattern in patterns:

                if re.search(pattern, normalized_text):
                    violations.append(violation_type)
                    break

        if not violations:
            return PolicyDetection(
                violations=[],
                score=0.0,
            )

        # Financial/compliance violations are treated as high risk.
        score = min(
            1.0,
            0.65 + (len(violations) - 1) * 0.15,
        )

        return PolicyDetection(
            violations=violations,
            score=round(score, 2),
        )