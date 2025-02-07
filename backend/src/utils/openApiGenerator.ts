import { OpenApiGeneratorV3, OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Create a single registry instance to be used throughout
const registry = new OpenAPIRegistry();

// Schema Definitions
const addressSchema = z.object({
  street: z.string().openapi({ description: 'Street address' }),
  city: z.string().openapi({ description: 'City name' }),
  country: z.string().openapi({ description: 'Country name' }),
  postalCode: z.string().openapi({ description: 'Postal code' })
});

const userSchema = z.object({
  userId: z.string().uuid().openapi({ description: 'Unique user identifier' }),
  firstName: z.string().openapi({ description: 'User\'s first name' }),
  lastName: z.string().openapi({ description: 'User\'s last name' }),
  email: z.string().email().openapi({ description: 'User\'s email address' }),
  dateOfBirth: z.string().openapi({ description: 'User\'s date of birth' }),
  address: addressSchema
});

const accountSchema = z.object({
  accountId: z.string().uuid().openapi({ description: 'Unique account identifier' }),
  accountNumber: z.string().openapi({ description: 'Account number' }),
  userId: z.string().uuid().openapi({ description: 'Owner\'s user ID' }),
  balance: z.number().openapi({ description: 'Current balance' }),
  status: z.enum(['active', 'inactive', 'closed']).openapi({ description: 'Account status' }),
  createdAt: z.string().openapi({ description: 'Account creation timestamp' })
});

const paymentSchema = z.object({
  paymentId: z.string().uuid().openapi({ description: 'Unique payment identifier' }),
  amount: z.number().openapi({ description: 'Payment amount' }),
  fromAccount: z.string().uuid().openapi({ description: 'Source account ID' }),
  toAccount: z.string().uuid().openapi({ description: 'Destination account ID' }),
  status: z.enum(['pending', 'completed', 'failed']).openapi({ description: 'Payment status' }),
  transactionDate: z.string().openapi({ description: 'Transaction timestamp' })
});

function registerPaths() {
  // User Routes
  registry.registerPath({
    method: 'post',
    path: '/users',  // Remove /api/v1 prefix as it's in the server URL
    description: 'Create a new user',
    request: {
      body: {
        content: {
          'application/json': {
            schema: userSchema.omit({ userId: true })
          }
        }
      }
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: z.object({ userId: z.string() })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}',
    description: 'Get user by ID',
    request: {
      params: z.object({
        userId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'User found',
        content: {
          'application/json': {
            schema: userSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/users',
    description: 'Get all users',
    responses: {
      200: {
        description: 'List of users',
        content: {
          'application/json': {
            schema: z.array(userSchema)
          }
        }
      }
    }
  });

  // Additional User Routes
  registry.registerPath({
    method: 'put',
    path: '/users/{userId}',
    description: 'Update user details',
    request: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: {
        content: {
          'application/json': {
            schema: userSchema.partial().omit({ userId: true })
          }
        }
      }
    },
    responses: {
      200: {
        description: 'User updated successfully',
        content: {
          'application/json': {
            schema: z.object({ status: z.literal('updated') })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/users/{userId}',
    description: 'Delete user',
    request: {
      params: z.object({
        userId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'User deleted successfully',
        content: {
          'application/json': {
            schema: z.object({ status: z.literal('deleted') })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}/payments',
    description: "Get user's payment history",
    request: {
      params: z.object({
        userId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: "List of user's payments",
        content: {
          'application/json': {
            schema: z.array(paymentSchema)
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/users/{userId}/accounts',
    description: "Get user's accounts",
    request: {
      params: z.object({
        userId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: "List of user's accounts",
        content: {
          'application/json': {
            schema: z.array(accountSchema)
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'post',
    path: '/users/generate',
    description: 'Generate dummy user data',
    responses: {
      201: {
        description: 'Dummy user created successfully',
        content: {
          'application/json': {
            schema: userSchema.extend({
              status: z.literal('created')
            })
          }
        }
      }
    }
  });

  // Account Routes
  registry.registerPath({
    method: 'post',
    path: '/accounts',
    description: 'Create a new account',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              userId: z.string().uuid(),
              balance: z.number().optional()
            })
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Account created successfully',
        content: {
          'application/json': {
            schema: accountSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/accounts/{accountId}',
    description: 'Get account by ID',
    request: {
      params: z.object({
        accountId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'Account found',
        content: {
          'application/json': {
            schema: accountSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/accounts/user/{userId}',
    description: "Get user's accounts",
    request: {
      params: z.object({
        userId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: "List of user's accounts",
        content: {
          'application/json': {
            schema: z.array(accountSchema)
          }
        }
      }
    }
  });

  // Additional Account Routes
  registry.registerPath({
    method: 'put',
    path: '/accounts/{accountId}',
    description: 'Update account details',
    request: {
      params: z.object({
        accountId: z.string().uuid()
      }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              status: z.enum(['active', 'inactive', 'closed'])
            })
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Account updated successfully',
        content: {
          'application/json': {
            schema: z.object({
              status: z.string(),
              message: z.string()
            })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/accounts/{accountId}',
    description: 'Close account',
    request: {
      params: z.object({
        accountId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'Account closed successfully',
        content: {
          'application/json': {
            schema: z.object({
              status: z.literal('closed'),
              message: z.string()
            })
          }
        }
      }
    }
  });

  // Payment Routes
  registry.registerPath({
    method: 'post',
    path: '/payments',
    description: 'Create a new payment',
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              amount: z.number(),
              fromAccount: z.string().uuid(),
              toAccount: z.string().uuid(),
              transactionDate: z.string()
            })
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Payment created successfully',
        content: {
          'application/json': {
            schema: paymentSchema
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'get',
    path: '/payments/{paymentId}',
    description: 'Get payment by ID',
    request: {
      params: z.object({
        paymentId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'Payment found',
        content: {
          'application/json': {
            schema: paymentSchema
          }
        }
      }
    }
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
            schema: z.array(paymentSchema)
          }
        }
      }
    }
  });

  // Additional Payment Routes
  registry.registerPath({
    method: 'put',
    path: '/payments/{paymentId}',
    description: 'Update payment details',
    request: {
      params: z.object({
        paymentId: z.string().uuid()
      }),
      body: {
        content: {
          'application/json': {
            schema: paymentSchema.partial().omit({ paymentId: true })
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Payment updated successfully',
        content: {
          'application/json': {
            schema: z.object({ message: z.string() })
          }
        }
      }
    }
  });

  registry.registerPath({
    method: 'delete',
    path: '/payments/{paymentId}',
    description: 'Delete payment',
    request: {
      params: z.object({
        paymentId: z.string().uuid()
      })
    },
    responses: {
      200: {
        description: 'Payment deleted successfully',
        content: {
          'application/json': {
            schema: z.object({ message: z.string() })
          }
        }
      }
    }
  });
}

export function generateOpenApiSpec() {
  console.log('Starting OpenAPI spec generation...');

  // Register schemas
  registry.register('User', userSchema);
  registry.register('Account', accountSchema);
  registry.register('Payment', paymentSchema);

  // Register all paths
  registerPaths();

  const generator = new OpenApiGeneratorV3(registry.definitions);
  
  const spec = generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'API for managing banking users, accounts, and payments',
    },
    servers: [{ url: '/api/v1' }],
  });

  // Write spec to file
  const outputPath = path.join(__dirname, '../../openapi.yaml');
  const yamlString = YAML.stringify(spec, 10, 2);
  fs.writeFileSync(outputPath, yamlString);
  console.log(`OpenAPI spec generated at: ${outputPath}`);
}

// Export schemas for validation
export const schemas = {
  userSchema,
  accountSchema,
  paymentSchema,
};

// Generate spec when run directly
if (require.main === module) {
  console.log('Generating OpenAPI spec...');
  generateOpenApiSpec();
  console.log('Done!');
} 