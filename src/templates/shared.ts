import { projectNameToVar } from '../utils.js';

export interface SharedOptions {
  projectName: string;
  orm: 'drizzle' | 'mongoose';
}

export function envContent(opts: SharedOptions): string {
  const varName = projectNameToVar(opts.projectName).toUpperCase();
  const dbLines = opts.orm === 'drizzle'
    ? `# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${opts.projectName}
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=${opts.projectName}`
    : `# MongoDB
MONGO_URI=mongodb://admin:admin@localhost:27017/${opts.projectName}?authSource=admin
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=${opts.projectName}`;

  return `# ─── App ─────────────────────────────────────────
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173

# ─── Database ──────────────────────────────────
${dbLines}

# ─── JWT / Auth ───────────────────────────────
JWT_SECRET=change-me-to-a-random-secret
JWT_EXPIRES_IN=7d

# ─── Logging ──────────────────────────────────
LOG_LEVEL=debug
`;
}

export function envExampleContent(opts: SharedOptions): string {
  return envContent(opts).replace(/=.*/g, '=');
}

export function gitignoreContent(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/

# Docker
docker-data/

# Misc
*.pem
.cache/
tmp/
`;
}

export function eslintConfigContent(): string {
  return `{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "env": {
    "node": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
`;
}

export function prettierConfigContent(): string {
  return `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;
}

export function dockerfileBackendContent(): string {
  return `# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci --only=production

COPY src/ ./src/
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app

RUN addgroup --system app && adduser --system -G app app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

USER app
EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
`;
}

export function dockerfileFrontendContent(frontend: 'vue' | 'react'): string {
  const buildCmd = frontend === 'vue' ? 'npm run build' : 'npm run build';
  const outputDir = frontend === 'vue' ? 'dist' : '.next';
  const serveStage = frontend === 'react'
    ? `# ---- Production Stage ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system app && adduser --system -G app app

COPY --from=builder /app/${outputDir} ./${outputDir}
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.* ./

USER app
EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]`
    : `# ---- Production Stage ----
FROM nginx:alpine
COPY --from=builder /app/${outputDir} /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  return `# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY . .
RUN ${buildCmd}

${serveStage}
`;
}

export function composeContent(opts: SharedOptions): string {
  const dbService = opts.orm === 'drizzle'
    ? `  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ${opts.projectName}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5`
    : `  db:
    image: mongo:7
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
      MONGO_INITDB_DATABASE: ${opts.projectName}
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 5s
      timeout: 5s
      retries: 5`;

  return `# ─── Unified Compose ────────────────────────────
# Spins up the full stack: app + database

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: \${DATABASE_URL}
    depends_on:
      db:
        condition: service_healthy

${dbService}

volumes:
${opts.orm === 'drizzle' ? '  pgdata:' : '  mongodata:'}
`;
}
