import { Hono } from 'hono';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { usersRouter } from '../routes/users';
import { accountsRouter } from '../routes/accounts';
import { paymentsRouter } from '../routes/payments';

function getAllRoutes(app: Hono): Set<string> {
  const routes = new Set<string>();
  
  app.routes.forEach(route => {
    // Convert Hono route pattern to OpenAPI pattern
    const path = '/api/v1' + route.path.replace(/:([^/]+)/g, '{$1}');
    routes.add(`${route.method} ${path}`);
  });
  
  return routes;
}

function getOpenApiRoutes(): Set<string> {
  const openApiPath = path.join(__dirname, '../../openapi.yaml');
  const openApiContent = fs.readFileSync(openApiPath, 'utf8');
  const openApi = YAML.parse(openApiContent);
  
  const routes = new Set<string>();
  
  Object.entries(openApi.paths).forEach(([path, methods]: [string, any]) => {
    Object.keys(methods).forEach(method => {
      routes.add(`${method.toUpperCase()} /api/v1${path}`);
    });
  });
  
  return routes;
}

function validateRoutes() {
  const app = new Hono();
  
  // Mount all routers
  app.route('/users', usersRouter);
  app.route('/accounts', accountsRouter);
  app.route('/payments', paymentsRouter);

  const implementedRoutes = getAllRoutes(app);
  const specifiedRoutes = getOpenApiRoutes();

  const missingFromSpec = [...implementedRoutes].filter(route => !specifiedRoutes.has(route));
  const missingFromImpl = [...specifiedRoutes].filter(route => !implementedRoutes.has(route));

  if (missingFromSpec.length > 0) {
    console.error('Routes missing from OpenAPI spec:', missingFromSpec);
  }

  if (missingFromImpl.length > 0) {
    console.error('Routes in OpenAPI spec but not implemented:', missingFromImpl);
  }

  if (missingFromSpec.length === 0 && missingFromImpl.length === 0) {
    console.log('✅ All routes are properly documented in OpenAPI spec');
    return true;
  }
  
  return false;
}

if (require.main === module) {
  const isValid = validateRoutes();
  process.exit(isValid ? 0 : 1);
}

export { validateRoutes }; 