import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { usersRouter } from './routes/users';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments';
import { testCaseGeneratorRouter } from './routes/testCaseGenerator';
import YAML from 'yamljs';
import path from 'path';

// Create the Hono app
const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Mount routers
app.route('/api/v1/users', usersRouter);
app.route('/api/v1/accounts', accountsRouter);
app.route('/api/v1/payments', paymentsRouter);
app.route('/api/v1', testCaseGeneratorRouter);

// Swagger UI routes
let swaggerDocument;
try {
  // Make sure the file exists at backend/openapi.yaml
  swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
} catch (err) {
  console.error("Error loading openapi.yaml:", err);
  swaggerDocument = {};
}

app.get('/api/v1/api-docs/swagger.json', (c) => c.json(swaggerDocument));

app.get('/api/v1/api-docs', async (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/v1/api-docs/swagger.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

// If not generating the OpenAPI spec, start the server
if (!process.env.GENERATE_OPENAPI) {
  const port = 3000;
  console.log(`Server is running on http://localhost:${port}/api/v1/`);
  console.log(`API documentation available at http://localhost:${port}/api/v1/api-docs`);
  
  serve({
    fetch: app.fetch,
    port
  });
} else {
  console.log("OpenAPI generation mode enabled.");
  // If you need additional behavior for generation, add here.
}