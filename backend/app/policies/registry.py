from app.policies.profiles import (
    ApplicationPolicy,
    FINANCIAL_DECISION,
    CUSTOMER_SUPPORT,
    INTERNAL_KNOWLEDGE,
)


class PolicyRegistry:

    def __init__(self):

        self._policies: dict[str, ApplicationPolicy] = {
            FINANCIAL_DECISION.name: FINANCIAL_DECISION,
            CUSTOMER_SUPPORT.name: CUSTOMER_SUPPORT,
            INTERNAL_KNOWLEDGE.name: INTERNAL_KNOWLEDGE,
        }

    def get(self, application: str) -> ApplicationPolicy:

        if application not in self._policies:
            raise ValueError(
                f"Unknown application policy: {application}"
            )

        return self._policies[application]

    def list_policies(self) -> list[ApplicationPolicy]:

        return list(self._policies.values())