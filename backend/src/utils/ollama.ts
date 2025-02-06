import { User } from '../types';

const OLLAMA_BASE_URL = 'http://localhost:11434/api';

export async function generateDummyUser(): Promise<User> {
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
    Make sure the email is properly formatted and the date is a valid date.
    Make sure the names are not just always john doe or jane smith, make these names unique and realistic.
    Return only the JSON object, no additional text.`;

  try {
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
    // Extract the JSON string from the response and parse it
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const userData: User = JSON.parse(jsonMatch[0]);
    return userData;
  } catch (error) {
    console.error('Error generating dummy user:', error);
    throw error;
  }
} 