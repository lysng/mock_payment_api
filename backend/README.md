# Hono TypeScript Server with SQLite

This is a TypeScript server implementation using Hono framework and SQLite database, following the OpenAPI specification.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Endpoints

- POST /users - Create a new user
- POST /accounts - Create a new account
- DELETE /accounts/:accountId - Close an account
- POST /payments - Process a payment

## Database

The application uses SQLite as the database, stored in `payments.db`. The database schema includes:

- users table: Stores user information
- accounts table: Stores account information
- payments table: Stores payment transactions

## Development

To build the project:
```bash
npm run build
```

To start the production server:
```bash
npm start
```