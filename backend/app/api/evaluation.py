from fastapi import APIRouter
from pydantic import BaseModel

from app.engines.risk_engine import RiskEngine
from app.engines.consequence_engine import ConsequenceEngine
from app.engines.autonomy_engine import AutonomyEngine
from app.services.response_analyzer import ResponseAnalyzer
from app.policies.registry import PolicyRegistry
from app.grounding.knowledge_base import KnowledgeBase
from app.grounding.claim_verifier import ClaimVerifier
from app.grounding.grounding_engine import GroundingEngine
from app.services.audit_service import AuditService


router = APIRouter(prefix="/api", tags=["Evaluation"])


# Engine instances
risk_engine = RiskEngine()
consequence_engine = ConsequenceEngine()
policy_registry = PolicyRegistry()
autonomy_engine = AutonomyEngine()
response_analyzer = ResponseAnalyzer()
audit_service = AuditService()

knowledge_base = KnowledgeBase()
claim_verifier = ClaimVerifier(knowledge_base)
grounding_engine = GroundingEngine(claim_verifier)


class EvaluationRequest(BaseModel):
    application: str
    response: str


@router.post("/evaluate")
def evaluate_response(request: EvaluationRequest):

    # 1. Analyze the actual AI response
    analysis = response_analyzer.analyze(request.response)

    # 2. Verify detected claims against enterprise knowledge
    grounding = grounding_engine.verify_claims(
        analysis.claims
    )

    # 3. Load the application-specific governance policy
    application_policy = policy_registry.get(request.application)

    # 4. Convert detector signals into Risk Engine inputs
    risk = risk_engine.assess(
        hallucination=grounding.contradiction_score,
        unsupported_claim=analysis.claim_score,
        privacy=analysis.pii_score,
        bias=0.0,
        safety=0.0,
        policy_violation=analysis.policy_score,
    )

    # 5. Calculate consequence using the application's
    #    policy-specific consequence profile
    consequence = consequence_engine.assess(
        workflow_criticality=application_policy.workflow_criticality,
        user_impact=application_policy.user_impact,
        regulatory_exposure=application_policy.regulatory_exposure,
        data_sensitivity=application_policy.data_sensitivity,
        actionability=application_policy.actionability,
    )

    # 6. Identify critical risks that can override
    #    the normal numerical decision
    critical_risks = []

    if analysis.pii_score >= 0.80:
        critical_risks.append("critical_pii")

    if (
        request.application == "financial_decision"
        and grounding.contradiction_score > 0
    ):
        critical_risks.append("high_risk_financial_claim")

    # 7. Make final autonomy/governance decision
    decision = autonomy_engine.decide(
        risk_score=risk.overall_score,
        consequence_score=consequence.overall_score,
        policy=application_policy,
        critical_risks=critical_risks,
    )
    
    audit_service.record(
        application=request.application,
        response=request.response,

        analysis={
            "overall_signal": analysis.overall_risk_signal,
            "critical_risks": critical_risks,
            "pii": {
                "detected": len(analysis.pii_entities) > 0,
                "entities": analysis.pii_entities,
                "score": analysis.pii_score,
            },
            "claims": {
                "detected": len(analysis.claims) > 0,
                "claims": analysis.claims,
                "score": analysis.claim_score,
            },
            "policy": {
                "violations": analysis.policy_violations,
                "score": analysis.policy_score,
            },
            "grounding": {
                "overall_score": grounding.overall_score,
                "contradiction_score": grounding.contradiction_score,
                "unknown_score": grounding.unknown_score,
                "verifications": [
                    {
                        "claim": result.claim,
                        "status": result.status,
                        "confidence": result.confidence,
                        "reason": result.reason,
                        "evidence": result.evidence,
                    }
                    for result in grounding.verifications
                ],
            },
        },

        risk={
            "overall_score": risk.overall_score,
            "hallucination": risk.hallucination,
            "unsupported_claim": risk.unsupported_claim,
            "privacy": risk.privacy,
            "bias": risk.bias,
            "safety": risk.safety,
            "policy_violation": risk.policy_violation,
        },

        consequence={
            "overall_score": consequence.overall_score,
            "workflow_criticality": consequence.workflow_criticality,
            "user_impact": consequence.user_impact,
            "regulatory_exposure": consequence.regulatory_exposure,
            "data_sensitivity": consequence.data_sensitivity,
            "actionability": consequence.actionability,
        },

        decision={
            "action": decision.action,
            "autonomy_score": decision.autonomy_score,
            "reason": decision.reason,
        },
    )

    # 8. Return complete explainable evaluation
    return {
        "application": request.application,

        "response": request.response,

        "analysis": {
            "overall_signal": analysis.overall_risk_signal,
            "critical_risks": critical_risks,

            "pii": {
                "detected": len(analysis.pii_entities) > 0,
                "entities": analysis.pii_entities,
                "score": analysis.pii_score,
            },

            "claims": {
                "detected": len(analysis.claims) > 0,
                "claims": analysis.claims,
                "score": analysis.claim_score,
            },

            "policy": {
                "violations": analysis.policy_violations,
                "score": analysis.policy_score,
            },

            "grounding": {
                "overall_score": grounding.overall_score,
                "contradiction_score": grounding.contradiction_score,
                "unknown_score": grounding.unknown_score,
                "verifications": [
                    {
                        "claim": result.claim,
                        "status": result.status,
                        "confidence": result.confidence,
                        "reason": result.reason,
                        "evidence": result.evidence,
                    }
                    for result in grounding.verifications
                ],
            },
        },

        "risk": {
            "overall_score": risk.overall_score,
            "hallucination": risk.hallucination,
            "unsupported_claim": risk.unsupported_claim,
            "privacy": risk.privacy,
            "bias": risk.bias,
            "safety": risk.safety,
            "policy_violation": risk.policy_violation,
        },

        "consequence": {
            "overall_score": consequence.overall_score,
            "workflow_criticality": application_policy.workflow_criticality,
            "user_impact": application_policy.user_impact,
            "regulatory_exposure": application_policy.regulatory_exposure,
            "data_sensitivity": application_policy.data_sensitivity,
            "actionability": application_policy.actionability,
        },

        "decision": {
            "action": decision.action,
            "autonomy_score": decision.autonomy_score,
            "reason": decision.reason,
        },
    }

@router.get("/audit")
def get_audit_log():
    records = audit_service.list_records()

    return {
        "count": len(records),
        "records": records,
    }


@router.get("/audit/{record_id}")
def get_audit_record(record_id: int):

    record = audit_service.get_record(record_id)

    if record is None:
        return {
            "error": "Audit record not found."
        }

    return record