import { projectNameToPascal, projectNameToVar } from '../utils.js';
import { drizzlePackageJson } from './drizzle.js';
import { mongoosePackageJson } from './mongoose.js';
import type { ModuleDefinition } from './backend-module.js';

export interface BackendOptions {
  projectName: string;
  orm: 'drizzle' | 'mongoose';
}

function ormScripts(orm: 'drizzle' | 'mongoose') {
  if (orm === 'drizzle') {
    return {
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'tsx src/shared/database/migrate.ts',
      'db:studio': 'drizzle-kit studio',
    };
  }
  return {};
}

export function backendPackageJson(opts: BackendOptions): string {
  const ormDeps = opts.orm === 'drizzle' ? drizzlePackageJson() : mongoosePackageJson();

  return JSON.stringify(
    {
      name: `${opts.projectName}-api`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'tsx watch src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        lint: 'eslint src/ --ext .ts',
        format: 'prettier --write "src/**/*.ts"',
        ...ormScripts(opts.orm),
      },
      dependencies: {
        express: '^4.21.0',
        cors: '^2.8.5',
        helmet: '^8.0.0',
        'express-rate-limit': '^7.4.0',
        morgan: '^1.10.0',
        dotenv: '^16.4.0',
        'swagger-jsdoc': '^6.2.8',
        'swagger-ui-express': '^5.0.1',
        ...ormDeps,
      },
      devDependencies: {
        '@types/express': '^5.0.0',
        '@types/cors': '^2.8.17',
        '@types/morgan': '^1.9.9',
        '@types/swagger-jsdoc': '^6.0.4',
        '@types/swagger-ui-express': '^4.1.7',
        '@types/node': '^22.10.0',
        'tsx': '^4.19.0',
        'typescript': '^5.7.0',
        'eslint': '^9.15.0',
        '@typescript-eslint/eslint-plugin': '^8.15.0',
        '@typescript-eslint/parser': '^8.15.0',
        'prettier': '^3.4.0',
        'eslint-config-prettier': '^9.1.0',
      },
    },
    null,
    2,
  );
}

export function backendTsconfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ES2022',
        moduleResolution: 'bundler',
        lib: ['ES2022'],
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        sourceMap: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        paths: {
          '@/*': ['./src/*'],
        },
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    },
    null,
    2,
  );
}

export function backendConfig(): string {
  return `import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL || process.env.MONGO_URI || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  get isDev() {
    return this.nodeEnv === 'development';
  },
  get isProd() {
    return this.nodeEnv === 'production';
  },
};
`;
}

export function backendErrorMiddleware(): string {
  return `import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, status: err.statusCode },
    });
    return;
  }
  console.error('[Error]', err);
  res.status(500).json({
    error: { message: 'Internal server error', status: 500 },
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
`;
}

export function backendSwagger(modules: ModuleDefinition[]): string {
  const apisArray = modules.map((m) => `'./src/modules/${m.name}/${m.name}.routes.ts'`).join(',\n    ');

  return `import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '${projectNameToPascal('Api')} API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: \`http://localhost:\${config.port}\${config.apiPrefix}\`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    ${apisArray},
  ],
};

export function setupSwagger(app: Application): void {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
}
`;
}



export function backendMainIndex(modules: ModuleDefinition[], orm: 'drizzle' | 'mongoose'): string {
  const ormInit = orm === 'drizzle'
    ? `import { connectDatabase } from './shared/database/index.js';`
    : `import { connectDatabase } from './shared/database/index.js';`;

  const routeImports = modules
    .map((m) => `import { ${m.name}Router } from './modules/${m.name}/${m.name}.routes.js';`)
    .join('\n');

  const routeRegistrations = modules
    .map((m) => `app.use(\`\${config.apiPrefix}/${m.plural}\`, ${m.name}Router);`)
    .join('\n');

  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import { config } from './shared/config/index.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { setupSwagger } from './shared/swagger.js';
${ormInit}
${routeImports}

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

setupSwagger(app);

${routeRegistrations}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function main() {
  await connectDatabase();
  app.listen(config.port, config.host, () => {
    console.log(\`[Server] Running at http://\${config.host}:\${config.port}\`);
    console.log(\`[Server] API docs at http://\${config.host}:\${config.port}/api-docs\`);
  });
}

main().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});

export default app;
`;
}

export function backendApiHttp(modules: ModuleDefinition[]): string {
  const sections = modules
    .map((m) => {
      const pascal = m.pascal;
      return `
### ─── List ${pascal}s ─────────────────────────
GET http://localhost:3000/api/v1/${m.plural}

### ─── Get ${pascal} by ID ────────────────────
GET http://localhost:3000/api/v1/${m.plural}/1

### ─── Create ${pascal} ───────────────────────
POST http://localhost:3000/api/v1/${m.plural}
Content-Type: application/json

{
  ${m.fields
    .filter((f) => f.required)
    .map((f) => {
      const val = f.type === 'string' ? '"..."' : f.type === 'boolean' ? 'true' : '"..."';
      return `"${f.name}": ${val}`;
    })
    .join(',\n  ')}
}

### ─── Update ${pascal} ───────────────────────
PUT http://localhost:3000/api/v1/${m.plural}/1
Content-Type: application/json

{
  ${m.fields
    .filter((f) => f.type === 'string')
    .slice(0, 1)
    .map((f) => `"${f.name}": "..."`)
    .join(',\n  ')}
}

### ─── Delete ${pascal} ───────────────────────
DELETE http://localhost:3000/api/v1/${m.plural}/1
`;
    })
    .join('\n');

  return `### ─── Health Check ───────────────────────────
GET http://localhost:3000/health
${sections}
`;
}
