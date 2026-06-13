export interface MongooseOptions {
  projectName: string;
}

export function mongooseDbConnection(): string {
  return `import mongoose from 'mongoose';
import { config } from '../config/index.js';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.database.url);
    console.log('[DB] MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] Connection failed:', error);
    throw error;
  }
}

export { mongoose };
`;
}

export function mongoosePackageJson(): Record<string, string> {
  return {
    mongoose: '*',
  };
}
