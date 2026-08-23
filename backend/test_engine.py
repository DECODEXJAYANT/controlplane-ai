from app.engines.risk_engine import RiskEngine
from app.engines.consequence_engine import ConsequenceEngine
from app.engines.policy_engine import PolicyEngine
from app.engines.autonomy_engine import AutonomyEngine


risk_engine = RiskEngine()
consequence_engine = ConsequenceEngine()
policy_engine = PolicyEngine()
autonomy_engine = AutonomyEngine()


# Example: financial decision with unsupported claim

risk = risk_engine.assess(
    hallucination=0.70,
    unsupported_claim=0.90,
    privacy=0.05,
    bias=0.10,
    safety=0.05,
    policy_violation=0.30,
)

consequence = consequence_engine.assess(
    workflow_criticality=0.95,
    user_impact=0.90,
    regulatory_exposure=0.90,
    data_sensitivity=0.60,
    actionability=0.95,
)

policy = policy_engine.get_policy("financial_decision")

decision = autonomy_engine.decide(
    risk_score=risk.overall_score,
    consequence_score=consequence.overall_score,
    policy=policy,
)


print("\n=== CONTROLPLANE TEST ===")
print(f"Risk Score:       {risk.overall_score}")
print(f"Consequence:      {consequence.overall_score}")
print(f"Autonomy Score:   {decision.autonomy_score}")
print(f"Decision:         {decision.action}")
print(f"Reason:           {decision.reason}")