import { User } from '../types';
import fs from 'fs/promises';
import path from 'path';

const OLLAMA_BASE_URL = 'http://localhost:11434/api';

export async function generateDummyUser(role: 'sender' | 'receiver' = 'sender'): Promise<User> {
  const prompt = `Generate a realistic dummy user data in JSON format with the following fields:
    - firstName (string)
    - lastName (string)
    - email (string)
    - dateOfBirth (string in YYYY-MM-DD format)
    - address object containing:
      - street (string)
      - city (string)
      - country (string)
      - postalCode (string)
    
    Requirements:
    - Make sure the email is properly formatted and the date is a valid date
    - Generate a ${role === 'sender' ? 'business professional' : 'student'} persona
    - Make the names unique and realistic (not john doe or jane smith)
    - Make the email unique by including random numbers and the current timestamp
    - For email, use format: firstname.lastname.TIMESTAMP@example.com
    - Use different cities for sender and receiver
    
    Return only the JSON object, no additional text.`;

  try {
    const timestamp = Date.now();
    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const userData: User = JSON.parse(jsonMatch[0]);
    
    // Ensure email is unique by adding timestamp
    userData.email = `${userData.firstName.toLowerCase()}.${userData.lastName.toLowerCase()}.${timestamp}@example.com`;
    
    return userData;
  } catch (error) {
    console.error('Error generating dummy user:', error);
    throw error;
  }
}

interface CodeContext {
  types: string;
  dbSchema: string;
  routes: string;
}

async function getCodeContext(): Promise<CodeContext> {
  try {
    const typesContent = await fs.readFile(path.join(__dirname, '../types.ts'), 'utf-8');
    const dbContent = await fs.readFile(path.join(__dirname, '../db.ts'), 'utf-8');

    // Extract only the type definitions
    const typeMatches = typesContent.match(/export interface.*?}/gs) || [];
    const types = typeMatches.join('\n\n');

    // Extract CREATE TABLE statements
    const schemaMatches = dbContent.match(/CREATE TABLE.*?;/gs) || [];
    const schema = schemaMatches.join('\n\n');

    // Create a summary of available routes
    const routes = `
    Available Routes:
    - POST /api/v1/users - Create user
    - GET /api/v1/users - Get all users
    - GET /api/v1/users/:userId - Get user by ID
    - PUT /api/v1/users/:userId - Update user
    - DELETE /api/v1/users/:userId - Delete user
    - GET /api/v1/users/:userId/payments - Get user payments
    - GET /api/v1/users/:userId/accounts - Get user accounts
    - POST /api/v1/accounts - Create account
    - GET /api/v1/accounts/:accountId - Get account
    - PUT /api/v1/accounts/:accountId - Update account
    - DELETE /api/v1/accounts/:accountId - Close account
    - POST /api/v1/payments - Create payment
    - GET /api/v1/payments - Get all payments
    - GET /api/v1/payments/:paymentId - Get payment
    - PUT /api/v1/payments/:paymentId - Update payment
    - DELETE /api/v1/payments/:paymentId - Delete payment`;

    return {
      types,
      dbSchema: schema,
      routes
    };
  } catch (error) {
    console.error('Error reading code context:', error);
    // Return minimal context if files can't be read
    return {
      types: 'interface User { userId: string; }',
      dbSchema: 'CREATE TABLE users (userId TEXT PRIMARY KEY);',
      routes: 'Basic CRUD routes for users, accounts, and payments'
    };
  }
}

function sanitizeJsonString(str: string): string {
  // First, find the JSON object in the response
  const jsonMatch = str.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  let jsonStr = jsonMatch[0];
  
  // Remove any markdown code block syntax
  jsonStr = jsonStr.replace(/```json\s*|\s*```/g, '');
  
  // Remove any control characters except newlines and tabs
  jsonStr = jsonStr.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  
  // Properly escape markdown and newlines in the implementation prompt
  jsonStr = jsonStr.replace(/"implementationPrompt":\s*"([^"]*)"/, (match, p1) => {
    const escapedContent = p1
      .replace(/\\/g, '\\\\') // Escape backslashes first
      .replace(/"/g, '\\"')   // Escape quotes
      .replace(/\n/g, '\\n')  // Escape newlines
      .replace(/\r/g, '\\r')  // Escape carriage returns
      .replace(/\t/g, '\\t')  // Escape tabs
      .replace(/\f/g, '\\f'); // Escape form feeds
    return `"implementationPrompt": "${escapedContent}"`;
  });
  
  // Remove any leading/trailing whitespace
  return jsonStr.trim();
}

export async function generateTestCases(requirement: string, context: string): Promise<{
  testCasePlan: Array<{
    title: string;
    scenarios: Array<{
      description: string;
      expectedOutcome: string;
    }>;
  }>;
  implementationPlan: Array<{
    step: string;
    details: string;
  }>;
  implementationPrompt: string;
}> {
  // Get current codebase context
  const codeContext = await getCodeContext();

  const prompt = `You are a senior software engineer working on a banking API. Generate a comprehensive test and implementation plan for the following business requirement:
  "${requirement}"
  
  Current Codebase Context:

  Types:
  ${codeContext.types}

  Database Schema:
  ${codeContext.dbSchema}

  Available Routes:
  ${codeContext.routes}

  Return a JSON response with the following structure. The response MUST be valid JSON and include all three fields:

  {
    "testCasePlan": [
      {
        "title": "string",
        "scenarios": [
          {
            "description": "string",
            "expectedOutcome": "string"
          }
        ]
      }
    ],
    "implementationPlan": [
      {
        "step": "string",
        "details": "string"
      }
    ],
    "implementationPrompt": "# Implementation Guide\\n\\n## 1. Business Requirement\\n{Original requirement}\\n\\n## 2. Test Cases Summary\\n{List key test scenarios}\\n\\n## 3. Implementation Steps\\n{Detailed step-by-step implementation guide}\\n\\n## 4. Database Changes\\n{Required schema modifications}\\n\\n## 5. API Changes\\n{New endpoints and modifications}\\n\\n## 6. Key Considerations\\n- Security: {security considerations}\\n- Performance: {performance considerations}\\n- Error Handling: {error handling approach}\\n\\n## 7. Files to Modify\\n{List of files with change descriptions}"
  }

  Important:
  - The response must be valid JSON
  - All fields must be present
  - The implementationPrompt should be a detailed markdown-formatted string
  - Each section in the implementationPrompt should be properly escaped with \\n
  - Include specific file paths and code examples where relevant
  - Do not include any text outside the JSON object`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2048
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.response) {
      throw new Error('No response from Ollama');
    }

    console.log('Raw Ollama response:', data.response);

    // Clean and extract JSON
    const cleanJson = sanitizeJsonString(data.response);
    console.log('Cleaned JSON:', cleanJson);

    try {
      const parsedResponse = JSON.parse(cleanJson);
      console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
      
      // Validate the response structure
      if (!Array.isArray(parsedResponse.testCasePlan)) {
        console.error('Invalid testCasePlan:', parsedResponse.testCasePlan);
        throw new Error('Invalid response structure: testCasePlan must be an array');
      }
      if (!Array.isArray(parsedResponse.implementationPlan)) {
        console.error('Invalid implementationPlan:', parsedResponse.implementationPlan);
        throw new Error('Invalid response structure: implementationPlan must be an array');
      }
      if (typeof parsedResponse.implementationPrompt !== 'string') {
        console.error('Invalid implementationPrompt:', parsedResponse.implementationPrompt);
        throw new Error('Invalid response structure: implementationPrompt must be a string');
      }

      // Validate each array has at least one item
      if (parsedResponse.testCasePlan.length === 0) {
        throw new Error('testCasePlan array is empty');
      }
      if (parsedResponse.implementationPlan.length === 0) {
        throw new Error('implementationPlan array is empty');
      }
      if (!parsedResponse.implementationPrompt.trim()) {
        throw new Error('implementationPrompt is empty');
      }

      // Log the final response being sent back
      console.log('Final response being sent:', JSON.stringify({
        testCasePlan: parsedResponse.testCasePlan,
        implementationPlan: parsedResponse.implementationPlan,
        implementationPrompt: parsedResponse.implementationPrompt
      }, null, 2));

      return parsedResponse;
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Attempted to parse:', cleanJson);
      throw new Error(`Failed to parse Ollama response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Ollama API error:', error);
    throw new Error('Failed to generate test cases: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
} 