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
      default: defaultName || 'my-fullstack-app',
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
      choices: [
        { name: 'Vue 3 (Vite + Pinia + TailwindCSS 4 + TanStack Query)', value: 'vue' },
        { name: 'React (Next.js 14 + TailwindCSS)', value: 'react' },
      ],
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Which backend framework would you like?',
      default: 'express',
      choices: [
        { name: 'Express (TypeScript)', value: 'express' },
      ],
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Which database / ORM would you like?',
      choices: [
        { name: 'Drizzle ORM (PostgreSQL)', value: 'drizzle' },
        { name: 'Mongoose (MongoDB)', value: 'mongoose' },
      ],
    },
  ]);

  return answers;
}
