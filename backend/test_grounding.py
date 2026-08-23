from app.grounding.knowledge_base import KnowledgeBase
from app.grounding.claim_verifier import ClaimVerifier
from app.grounding.grounding_engine import GroundingEngine


print("\n=== CONTROLPLANE GROUNDING TEST ===")

knowledge_base = KnowledgeBase()

print("\nKnowledge Base:")
for document in knowledge_base.all_documents():
    print(
        f"- {document['product']}: "
        f"{document['facts']}"
    )

print("\nSearch Test:")

results = knowledge_base.search(
    "The Premium Investment guarantees a 25% return."
)

for result in results:
    print(
        f"Found: {result['product']}"
    )


verifier = ClaimVerifier(knowledge_base)
engine = GroundingEngine(verifier)

claims = [
    "The Premium Investment guarantees a 25% return.",
    "The Premium Investment is eligible for everyone.",
]

result = engine.verify_claims(claims)

print(
    f"\nOverall Grounding Score: "
    f"{result.overall_score}"
)

for verification in result.verifications:

    print("\nClaim:")
    print(verification.claim)

    print("Status:")
    print(verification.status)

    print("Confidence:")
    print(verification.confidence)

    print("Reason:")
    print(verification.reason)