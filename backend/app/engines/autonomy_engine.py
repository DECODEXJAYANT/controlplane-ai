from dataclasses import dataclass

from app.policies.profiles import ApplicationPolicy


@dataclass
class AutonomyDecision:
    action: str
    autonomy_score: float
    reason: str


class AutonomyEngine:

    def decide(
        self,
        risk_score: float,
        consequence_score: float,
        policy: ApplicationPolicy,
        critical_risks: list[str] | None = None,
    ) -> AutonomyDecision:

        critical_risks = critical_risks or []

        # ---------------------------------------------------------
        # Overall autonomy score
        #
        # Higher risk + higher consequence
        # = less autonomy should be given to the AI.
        # ---------------------------------------------------------
        autonomy_score = round(
            risk_score * consequence_score,
            2,
        )

        # ---------------------------------------------------------
        # PRIORITY 1: Critical safety risk
        #
        # Safety always overrides every other decision.
        # ---------------------------------------------------------
        if "safety" in critical_risks:
            return AutonomyDecision(
                action="BLOCK",
                autonomy_score=autonomy_score,
                reason="Critical safety risk detected.",
            )

        # ---------------------------------------------------------
        # PRIORITY 2: Critical PII
        #
        # The application policy decides what happens when
        # critical personal information is exposed.
        # ---------------------------------------------------------
        if "critical_pii" in critical_risks:

            action = policy.critical_pii_action

            return AutonomyDecision(
                action=action,
                autonomy_score=autonomy_score,
                reason=(
                    "Critical personal data exposure detected."
                ),
            )

        # ---------------------------------------------------------
        # PRIORITY 3: High-risk financial claim
        #
        # Different applications can choose different responses:
        #
        # Financial Decision -> HUMAN_REVIEW
        # Customer Support  -> VERIFY
        # Internal Knowledge -> VERIFY
        # ---------------------------------------------------------
        if "high_risk_financial_claim" in critical_risks:

            action = policy.financial_claim_action

            return AutonomyDecision(
                action=action,
                autonomy_score=autonomy_score,
                reason=(
                    "High-risk financial claim detected "
                    "in a consequential workflow."
                ),
            )

        # ---------------------------------------------------------
        # PRIORITY 4: Absolute risk block
        #
        # Even without a named critical risk, extremely high
        # overall AI risk should block the response.
        # ---------------------------------------------------------
        if risk_score >= policy.block_threshold:
            return AutonomyDecision(
                action="BLOCK",
                autonomy_score=autonomy_score,
                reason="Critical AI risk detected.",
            )

        # ---------------------------------------------------------
        # PRIORITY 5: Human review
        #
        # High combined risk + consequence means the AI should
        # not act autonomously.
        # ---------------------------------------------------------
        if autonomy_score >= policy.review_threshold:
            return AutonomyDecision(
                action="HUMAN_REVIEW",
                autonomy_score=autonomy_score,
                reason=(
                    "Risk and consequence are sufficiently high "
                    "to require human oversight."
                ),
            )

        # ---------------------------------------------------------
        # PRIORITY 6: Verification
        #
        # Moderate risk requires grounding/verification before
        # the AI output is trusted.
        # ---------------------------------------------------------
        if autonomy_score >= policy.verify_threshold:
            return AutonomyDecision(
                action="VERIFY",
                autonomy_score=autonomy_score,
                reason=(
                    "Moderate risk requires verification "
                    "against trusted enterprise information."
                ),
            )

        # ---------------------------------------------------------
        # PRIORITY 7: Allow
        # ---------------------------------------------------------
        return AutonomyDecision(
            action="ALLOW",
            autonomy_score=autonomy_score,
            reason=(
                "Risk and consequence are within acceptable limits."
            ),
        )