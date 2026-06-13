import inquirer from 'inquirer';

export interface CliAnswers {
  projectName: string;
  frontend: 'vue' | 'react';
  backend: 'express';
  orm: 'drizzle' | 'mongoose';
}

export async function runPrompts(defaultName?: string): Promise<CliAnswers> {
  const answers = await inquirer.prompt<CliAnswers>([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      default: defaultName || 'my-app',
      validate: (input: string) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9][a-z0-9\-_]*$/i.test(input.trim()))
          return 'Use only letters, numbers, hyphens, and underscores';
        return true;
      },
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Which frontend framework would you like?',
      default: 'vue',
      choices: [
        {
          name: 'Vue 3 + Vite (Pinia, TanStack Query, TailwindCSS 4)',
          value: 'vue',
          short: 'Vue 3',
        },
        {
          name: 'Next.js 15 (React 19, Zustand, TanStack Query, TailwindCSS 4)',
          value: 'react',
          short: 'Next.js',
        },
      ],
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Which backend framework would you like?',
      default: 'express',
      choices: [
        {
          name: 'Express (TypeScript, modular domain-driven architecture)',
          value: 'express',
          short: 'Express',
        },
      ],
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Which database / ORM would you like?',
      default: 'drizzle',
      choices: [
        {
          name: 'Drizzle ORM (PostgreSQL - type-safe SQL, migrations included)',
          value: 'drizzle',
          short: 'Drizzle',
        },
        {
          name: 'Mongoose (MongoDB - schema-based document modeling)',
          value: 'mongoose',
          short: 'Mongoose',
        },
      ],
    },
  ]);

  return answers;
}
