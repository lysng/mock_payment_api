import { User } from '../types';

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