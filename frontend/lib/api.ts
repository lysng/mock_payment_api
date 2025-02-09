export interface TestCaseRequest {
  requirement: string;
  context: string;
}

interface TestCase {
  title: string;
  scenarios: Array<{
    description: string;
    expectedOutcome: string;
  }>;
}

interface ImplementationStep {
  step: string;
  details: string;
}

export interface TestCaseResponse {
  testCasePlan: TestCase[];
  implementationPlan: ImplementationStep[];
  implementationPrompt: string;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

export async function generateTestCasePlan(data: TestCaseRequest): Promise<TestCaseResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-test-case`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate test case plan');
  }

  return response.json();
} 