import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Create schemas from your types
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string(),
});

const userSchema = z.object({
  userId: z.string().uuid().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  address: addressSchema,
});

const accountSchema = z.object({
  accountId: z.string().uuid(),
  accountNumber: z.string(),
  userId: z.string().uuid(),
  balance: z.number().default(0),
  status: z.enum(['active', 'closed']).default('active'),
  createdAt: z.string(),
});

const paymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number(),
  fromAccount: z.string().uuid(),
  toAccount: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
  transactionDate: z.string(),
});

function registerUserPaths(registry: OpenAPIRegistry) {
  // User paths
  registry.registerPath({
    method: 'post',
    path: '/users',
    description: 'Create a new user',
    request: {
      body: {
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: z.object({
              userId: z.string().uuid(),
              status: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users',
    description: 'Retrieve all users',
    responses: {
      200: {
        description: 'List of users',
        content: {
          'application/json': {
            schema: z.array(userSchema),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    description: 'Retrieve a single user by userId',
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'User found',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/users/{userId}',
    description: 'Update a user by userId',
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: userSchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User updated',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
            }),
          },
        },
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/users/{userId}',
    description: 'Remove a user by userId',
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'User deleted',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
            }),
          },
        },
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}/payments',
    description: 'Get user\'s payments',
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'List of user\'s payments',
        content: {
          'application/json': {
            schema: z.array(paymentSchema),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}/accounts',
    description: 'Get user\'s accounts',
    request: {
      params: z.object({
        userId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'List of user\'s accounts',
        content: {
          'application/json': {
            schema: z.array(accountSchema),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/users/generate',
    description: 'Generate and create a new user with dummy data',
    responses: {
      201: {
        description: 'Dummy user created successfully',
        content: {
          'application/json': {
            schema: userSchema.extend({
              status: z.literal('created'),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
              details: z.string(),
            }),
          },
        },
      },
    },
  });
}

function registerAccountPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/accounts',
    description: 'Create new account',
    request: {
      body: {
        content: {
          'application/json': {
            schema: accountSchema.pick({ userId: true, balance: true }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Account created',
        content: {
          'application/json': {
            schema: z.object({
              accountId: z.string().uuid(),
              accountNumber: z.string(),
              status: z.string(),
            }),
          },
        },
      },
      404: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/accounts/{accountId}',
    description: 'Get account by ID',
    request: {
      params: z.object({
        accountId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Account found',
        content: {
          'application/json': {
            schema: accountSchema,
          },
        },
      },
      404: {
        description: 'Account not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/accounts/{accountId}',
    description: 'Update account',
    request: {
      params: z.object({
        accountId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: accountSchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Account updated',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/accounts/{accountId}',
    description: 'Close account',
    request: {
      params: z.object({
        accountId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Account closed',
        content: {
          'application/json': {
            schema: z.object({
              status: z.literal('closed'),
              closureDate: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });
}

function registerPaymentPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/payments',
    description: 'Create new payment',
    request: {
      body: {
        content: {
          'application/json': {
            schema: paymentSchema.omit({ paymentId: true }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Payment created',
        content: {
          'application/json': {
            schema: z.object({
              paymentId: z.string().uuid(),
              status: z.string(),
              transactionDate: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/payments',
    description: 'Get all payments',
    responses: {
      200: {
        description: 'List of payments',
        content: {
          'application/json': {
            schema: z.array(paymentSchema),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/payments/{paymentId}',
    description: 'Get payment by ID',
    request: {
      params: z.object({
        paymentId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Payment found',
        content: {
          'application/json': {
            schema: paymentSchema,
          },
        },
      },
      404: {
        description: 'Payment not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/payments/{paymentId}',
    description: 'Update payment',
    request: {
      params: z.object({
        paymentId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: paymentSchema.partial(),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Payment updated',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/payments/{paymentId}',
    description: 'Delete payment',
    request: {
      params: z.object({
        paymentId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Payment deleted',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
      500: {
        description: 'Server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  });
}

export function generateOpenApiSpec() {
  console.log('Starting OpenAPI spec generation...');
  const registry = new OpenAPIRegistry();

  // Register schemas
  registry.register('User', userSchema);
  registry.register('Account', accountSchema);
  registry.register('Payment', paymentSchema);

  // Register all paths
  registerUserPaths(registry);
  registerAccountPaths(registry);
  registerPaymentPaths(registry);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  
  const spec = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'API for managing banking users, accounts, and payments',
    },
    servers: [{ url: '/api/v1' }],
  });

  // Write as YAML instead of JSON
  const outputPath = path.join(__dirname, '../../openapi.yaml');
  const yamlString = YAML.stringify(spec, 4);
  fs.writeFileSync(outputPath, yamlString);
  console.log(`OpenAPI spec generated at: ${outputPath}`);
}

// Make sure this is called when running the file directly
if (require.main === module) {
  console.log('Generating OpenAPI spec...');
  generateOpenApiSpec();
  console.log('Done!');
}

export const schemas = {
  userSchema,
  accountSchema,
  paymentSchema,
}; 