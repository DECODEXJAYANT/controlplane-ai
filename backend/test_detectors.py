from app.detectors.pii_detector import PIIDetector
from app.detectors.policy_detector import PolicyDetector
from app.detectors.claim_detector import ClaimDetector


response = """
The customer John Smith can be contacted at
john.smith@example.com.

His PAN is ABCDE1234F.

He is guaranteed a 25% return on this investment
and is eligible for the premium financial product.
"""


pii = PIIDetector().detect(response)
policy = PolicyDetector().detect(response)
claims = ClaimDetector().detect(response)


print("\n=== CONTROLPLANE DETECTOR TEST ===")

print("\nPII")
print(f"Detected: {pii.detected}")
print(f"Entities: {pii.entities}")
print(f"Score:    {pii.score}")

print("\nPOLICY")
print(f"Violations: {policy.violations}")
print(f"Score:      {policy.score}")

print("\nCLAIMS")
print(f"Claims: {claims.claims}")
print(f"Score:  {claims.score}")