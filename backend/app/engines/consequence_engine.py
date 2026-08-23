from dataclasses import dataclass


@dataclass
class ConsequenceAssessment:
    workflow_criticality: float
    user_impact: float
    regulatory_exposure: float
    data_sensitivity: float
    actionability: float

    @property
    def overall_score(self) -> float:
        score = (
            self.workflow_criticality * 0.30
            + self.user_impact * 0.20
            + self.regulatory_exposure * 0.20
            + self.data_sensitivity * 0.15
            + self.actionability * 0.15
        )

        return round(score, 2)


class ConsequenceEngine:

    def assess(
        self,
        workflow_criticality: float = 0.0,
        user_impact: float = 0.0,
        regulatory_exposure: float = 0.0,
        data_sensitivity: float = 0.0,
        actionability: float = 0.0,
    ) -> ConsequenceAssessment:

        return ConsequenceAssessment(
            workflow_criticality=workflow_criticality,
            user_impact=user_impact,
            regulatory_exposure=regulatory_exposure,
            data_sensitivity=data_sensitivity,
            actionability=actionability,
        )