import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { usersRouter } from './routes/users';
import { accountsRouter } from './routes/accounts';
import { paymentsRouter } from './routes/payments';
import YAML from 'yamljs';
import path from 'path';

const app = new Hono();

app.use('*', prettyJSON());

// Create API v1 group
const api = new Hono().basePath('/api/v1');

// API routes under /api/v1
api.route('/users', usersRouter);
api.route('/accounts', accountsRouter);
api.route('/payments', paymentsRouter);

// Mount API routes
app.route('', api);

// Swagger routes (outside API versioning)
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.get('/api-docs/swagger.json', (c) => c.json(swaggerDocument));
app.get('/api-docs', async (c) => {
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
            url: '/api-docs/swagger.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

serve(app, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('API documentation available at http://localhost:3000/api-docs');
});