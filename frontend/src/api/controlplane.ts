import type { PoliciesResponse } from "../types/evaluation";

const API_BASE_URL = "http://127.0.0.1:8000";

export interface EvaluationRequest {
  application: string;
  response: string;
}

export async function evaluateResponse(
  request: EvaluationRequest
) {
  const response = await fetch(
    `${API_BASE_URL}/api/evaluate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Evaluation failed: ${response.status}`
    );
  }

  return response.json();
}


export async function getPolicies(): Promise<PoliciesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/policies`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load policies: ${response.status}`
    );
  }

  return response.json();
}