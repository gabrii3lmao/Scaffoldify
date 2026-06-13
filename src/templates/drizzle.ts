import type { ModuleDefinition } from './backend-module.js';

export interface DrizzleOptions {
  projectName: string;
}

export function drizzleConfigContent(modules: ModuleDefinition[]): string {
  const schemaPaths = modules
    .map((m) => `    './src/modules/${m.name}/${m.name}.schema.ts'`)
    .join(',\n');

  return `import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: [
${schemaPaths},
  ],
  out: './src/shared/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
`;
}

export function drizzleDbConnection(): string {
  return `import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';
import { config } from '../config/index.js';

const pool = new Pool({
  connectionString: config.database.url,
});

export const db = drizzle(pool, { schema });

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('[DB] PostgreSQL connected successfully');
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    throw error;
  }
}
`;
}

export function drizzleSchemaBarrel(modules: ModuleDefinition[]): string {
  const exports = modules
    .map((m) => `export * from '../../modules/${m.name}/${m.name}.schema.js';`)
    .join('\n');

  return exports;
}

export function drizzleMigrateScript(): string {
  return `import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, connectDatabase } from './index.js';

async function main() {
  await connectDatabase();
  console.log('[Migration] Running migrations...');
  await migrate(db, { migrationsFolder: './src/shared/database/migrations' });
  console.log('[Migration] Migrations complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Migration] Failed:', err);
  process.exit(1);
});
`;
}

export function drizzlePackageJson(): Record<string, string> {
  return {
    'drizzle-orm': '^0.38.0',
    'drizzle-kit': '^0.30.0',
    'pg': '^8.13.0',
    '@types/pg': '^8.11.0',
  };
}
