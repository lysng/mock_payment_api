# Hono TypeScript Server with SQLite

This is a TypeScript server implementation using Hono framework and SQLite database, following the OpenAPI specification.

## Prerequisites

1. Install [Ollama](https://ollama.ai/)
2. Pull the Qwen2.5-coder model:
```bash
ollama pull qwen2.5-coder:7b
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate OpenAPI specification:
```bash
npm run generate-openapi
```

3. Validate API routes match OpenAPI spec:
```bash
npm run validate-openapi
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

The API documentation is automatically generated from the code. After running `generate-openapi`, you can find the OpenAPI specification in `openapi.yaml`.

### Main Endpoints

Users:
- POST /users - Create a new user
- GET /users - Get all users
- GET /users/{userId} - Get user by ID
- PUT /users/{userId} - Update user
- DELETE /users/{userId} - Delete user
- POST /users/generate - Generate dummy user data using Ollama
- GET /users/{userId}/payments - Get user's payments
- GET /users/{userId}/accounts - Get user's accounts

Accounts:
- POST /accounts - Create a new account
- GET /accounts/{accountId} - Get account by ID
- PUT /accounts/{accountId} - Update account
- DELETE /accounts/{accountId} - Close account

Payments:
- POST /payments - Create a new payment
- GET /payments - Get all payments
- GET /payments/{paymentId} - Get payment by ID
- PUT /payments/{paymentId} - Update payment
- DELETE /payments/{paymentId} - Delete payment

## Development

Available commands:
```bash
npm run dev          # Start development server
npm run build        # Build the project
npm start            # Start production server
npm run generate-openapi  # Generate OpenAPI specification
npm run validate-openapi  # Validate API implementation matches spec
```

## Database

The application uses SQLite as the database, stored in `payments.db`. The database schema includes:

- users table: Stores user information
- accounts table: Stores account information
- payments table: Stores payment transactions

## Troubleshooting

1. If Ollama requests fail, ensure:
   - Ollama is running locally (`ollama serve`)
   - The Qwen2.5-coder model is installed
   - Ollama is accessible at http://localhost:11434

2. If route validation fails:
   - Run `npm run generate-openapi` to update the spec
   - Check that all routes are properly documented in `openApiGenerator.ts`
   - Verify route implementations in the respective route files