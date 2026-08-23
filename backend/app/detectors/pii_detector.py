import re
from dataclasses import dataclass


@dataclass
class PIIDetection:
    detected: bool
    entities: list[str]
    score: float


class PIIDetector:

    PATTERNS = {
        "email": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",

        "phone": r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b",

        "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",

        "aadhaar": r"\b\d{4}[-\s]\d{4}[-\s]\d{4}\b",

        "credit_card": r"\b(?:\d{4}[-\s]?){3}\d{4}\b",
    }

    def detect(self, text: str) -> PIIDetection:

        detected_entities = []

        for entity_type, pattern in self.PATTERNS.items():

            matches = re.findall(pattern, text, re.IGNORECASE)

            if matches:
                detected_entities.append(entity_type)

        if not detected_entities:
            return PIIDetection(
                detected=False,
                entities=[],
                score=0.0,
            )

        # More sensitive data types receive higher risk.
        weights = {
            "email": 0.40,
            "phone": 0.45,
            "pan": 0.85,
            "aadhaar": 0.95,
            "credit_card": 1.0,
        }

        score = max(
            weights[entity]
            for entity in detected_entities
        )

        return PIIDetection(
            detected=True,
            entities=detected_entities,
            score=score,
        )