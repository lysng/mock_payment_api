# Banking API Server

A TypeScript-based banking API server using Hono, SQLite, and OpenAPI.

## Prerequisites

1. Install [Ollama](https://ollama.ai/)
2. Pull the Qwen2.5-coder model:
```bash
ollama pull qwen2.5-coder:7b
```

## Setup

```bash
# Install dependencies
npm install

# Start the server
npm run dev
```

## Testing

The project includes a comprehensive test suite for all API endpoints. Tests use Ollama for generating realistic test data.

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:users     # Test user endpoints
npm run test:accounts  # Test account endpoints
npm run test:payments  # Test payment endpoints
```

### Test Coverage

The test suite covers:
- User Management (CRUD operations)
- Account Operations (creation, updates, balance checks)
- Payment Processing (transfers between accounts)
- Transaction Validation
- Error Handling

### Test Output

Tests provide detailed, color-coded output showing:
- 🔍 Test suite headers
- ▶ Operation descriptions
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- 💰 Account balances
- 👤 User details
- 🏦 Transaction details

Example output:
```
🔍 Testing Payment Operations...
==================================================

▶ Setting up test accounts
  Sender: John Smith
  Receiver: Jane Doe
  Initial Balance: $1,000.00

▶ Executing payment
  Amount: $500.00
  Status: completed
  
Test: Payment Success
Result: ✅ PASSED
```

## API Documentation

OpenAPI documentation is available at `/docs` when the server is running.

## Development

```bash
# Generate OpenAPI specs
npm run generate-openapi

# Validate OpenAPI specs
npm run validate-openapi
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