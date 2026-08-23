from app.services.response_analyzer import ResponseAnalyzer


response = """
The customer John Smith can be contacted at
john.smith@example.com.

His PAN is ABCDE1234F.

He is guaranteed a 25% return on this investment
and is eligible for the premium financial product.
"""


analyzer = ResponseAnalyzer()

result = analyzer.analyze(response)


print("\n=== CONTROLPLANE RESPONSE ANALYSIS ===")

print(f"\nPII Score:       {result.pii_score}")
print(f"Claim Score:     {result.claim_score}")
print(f"Policy Score:    {result.policy_score}")

print(f"\nPII Entities:    {result.pii_entities}")
print(f"Policy Issues:   {result.policy_violations}")
print(f"Claims:          {result.claims}")

print(f"\nOverall Signal:  {result.overall_risk_signal}")