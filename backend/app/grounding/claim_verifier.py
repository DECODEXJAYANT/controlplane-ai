from dataclasses import dataclass

from app.grounding.knowledge_base import KnowledgeBase


@dataclass
class VerificationResult:
    claim: str
    status: str
    confidence: float
    evidence: dict | None
    reason: str


class ClaimVerifier:

    def __init__(self, knowledge_base: KnowledgeBase):
        self.knowledge_base = knowledge_base

    def verify(self, claim: str) -> VerificationResult:

        claim_lower = claim.lower()

        documents = self.knowledge_base.search(claim)

        if not documents:
            return VerificationResult(
                claim=claim,
                status="UNKNOWN",
                confidence=0.30,
                evidence=None,
                reason="No trusted enterprise evidence found.",
            )

        # ---------------------------------------------------------
        # SELECT THE MOST SPECIFIC PRODUCT DOCUMENT
        # ---------------------------------------------------------
        #
        # KnowledgeBase.search() may return multiple documents for
        # generic claims such as "this investment".
        #
        # Prefer a document whose complete product name is explicitly
        # mentioned in the claim.
        # ---------------------------------------------------------

        document = None

        for candidate in documents:
            product = candidate.get("product", "").lower().strip()

            if product and product in claim_lower:
                document = candidate
                break

        # If the claim does not explicitly identify a product,
        # do not guess which enterprise document applies.
        if document is None:

            if len(documents) > 1:
                return VerificationResult(
                    claim=claim,
                    status="UNKNOWN",
                    confidence=0.30,
                    evidence=None,
                    reason=(
                        "Multiple enterprise products match the claim, "
                        "but the claim does not identify a specific product."
                    ),
                )

            document = documents[0]

        facts = document.get("facts", {})

        # ---------------------------------------------------------
        # GUARANTEED RETURN
        # ---------------------------------------------------------

        mentions_guarantee = (
            "guarantee" in claim_lower
            or "guaranteed" in claim_lower
        )

        mentions_return = "return" in claim_lower

        if mentions_guarantee and mentions_return:

            guaranteed_return = facts.get(
                "guaranteed_return"
            )

            if guaranteed_return is False:
                return VerificationResult(
                    claim=claim,
                    status="CONTRADICTED",
                    confidence=0.96,
                    evidence=document,
                    reason=(
                        "Enterprise policy states that this "
                        "product does not provide a guaranteed return."
                    ),
                )

            if guaranteed_return is True:
                return VerificationResult(
                    claim=claim,
                    status="SUPPORTED",
                    confidence=0.94,
                    evidence=document,
                    reason=(
                        "Enterprise policy supports the guaranteed "
                        "return claim."
                    ),
                )

        # ---------------------------------------------------------
        # ELIGIBILITY
        # ---------------------------------------------------------

        mentions_eligibility = (
            "eligible" in claim_lower
            or "eligibility" in claim_lower
            or "qualify" in claim_lower
            or "qualifies" in claim_lower
            or "qualified" in claim_lower
        )

        if mentions_eligibility:

            eligibility_required = facts.get(
                "premium_eligibility_required"
            )

            if eligibility_required is True:

                universal_claim = (
                    "everyone" in claim_lower
                    or "anyone" in claim_lower
                    or "all customers" in claim_lower
                )

                if universal_claim:
                    return VerificationResult(
                        claim=claim,
                        status="CONTRADICTED",
                        confidence=0.93,
                        evidence=document,
                        reason=(
                            "Enterprise policy requires eligibility "
                            "criteria for this product."
                        ),
                    )

                return VerificationResult(
                    claim=claim,
                    status="UNKNOWN",
                    confidence=0.55,
                    evidence=document,
                    reason=(
                        "Eligibility criteria exist, but the available "
                        "claim does not contain enough information "
                        "to verify the customer's eligibility."
                    ),
                )

            if eligibility_required is False:
                return VerificationResult(
                    claim=claim,
                    status="SUPPORTED",
                    confidence=0.90,
                    evidence=document,
                    reason=(
                        "Enterprise policy does not require premium "
                        "eligibility for this product."
                    ),
                )

        # ---------------------------------------------------------
        # RELEVANT DOCUMENT, BUT NOT VERIFIABLE
        # ---------------------------------------------------------

        return VerificationResult(
            claim=claim,
            status="UNKNOWN",
            confidence=0.40,
            evidence=document,
            reason=(
                "Relevant enterprise information exists, but the "
                "claim could not be verified."
            ),
        )