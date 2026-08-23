from app.policies.registry import PolicyRegistry


registry = PolicyRegistry()

applications = [
    "financial_decision",
    "customer_support",
    "internal_knowledge",
]


print("\n=== CONTROLPLANE POLICY REGISTRY TEST ===")

for application in applications:

    policy = registry.get(application)

    print(f"\nApplication: {policy.name}")
    print(f"Description: {policy.description}")

    print("Consequence Profile:")
    print(f"  Workflow Criticality: {policy.workflow_criticality}")
    print(f"  User Impact:           {policy.user_impact}")
    print(f"  Regulatory Exposure:   {policy.regulatory_exposure}")
    print(f"  Data Sensitivity:      {policy.data_sensitivity}")
    print(f"  Actionability:         {policy.actionability}")

    print("Decision Thresholds:")
    print(f"  Verify:       {policy.verify_threshold}")
    print(f"  Human Review: {policy.review_threshold}")
    print(f"  Block:        {policy.block_threshold}")