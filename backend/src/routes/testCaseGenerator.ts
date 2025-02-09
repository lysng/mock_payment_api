import { Hono } from 'hono';
import { generateTestCases } from '../utils/ollama';
import { z } from 'zod';

const testCaseGenerator = new Hono();

// Request validation schema
const requestSchema = z.object({
  requirement: z.string().min(1, "Business requirement is required"),
  context: z.string().optional()
});

testCaseGenerator.post('/generate-test-case', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request body
    const validatedData = requestSchema.parse(body);
    
    console.log('Generating test cases for requirement:', validatedData.requirement);
    
    const result = await generateTestCases(
      validatedData.requirement,
      validatedData.context || 'banking_api'
    );
    
    console.log('Successfully generated test cases');
    return c.json(result);
  } catch (error) {
    console.error('Error in test case generator:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return c.json({ 
        error: 'Invalid request data',
        details: error.errors.map(e => e.message)
      }, 400);
    }
    
    // Handle other errors
    return c.json({ 
      error: 'Failed to generate test cases',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { testCaseGenerator as testCaseGeneratorRouter }; 