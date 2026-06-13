#!/usr/bin/env node

import { Command } from 'commander';
import pc from 'picocolors';
import { runPrompts } from './prompts.js';
import { scaffoldProject } from './scaffolder.js';
import { createSpinner, logError } from './utils.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getPackageVersion(): string {
  try {
    const pkgPath = resolve(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

const program = new Command();

program
  .name('scaffoldify')
  .description('Scaffold a production-ready fullstack project')
  .version(getPackageVersion(), '-v, --version', 'Output the current version')
  .argument('[project-name]', 'Name of the project')
  .option('-f, --frontend <framework>', 'Frontend framework (vue | react)')
  .option('-b, --backend <framework>', 'Backend framework (express)')
  .option('-d, --database <orm>', 'Database ORM (drizzle | mongoose)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpText(
    'after',
    `
${pc.bold('Examples:')}
  ${pc.cyan('scaffoldify my-project')}              ${pc.dim('# interactive mode')}
  ${pc.cyan('scaffoldify my-project --yes')}        ${pc.dim('# use defaults')}
  ${pc.cyan('scaffoldify my-project -f vue -d drizzle')}  ${pc.dim('# specific choices')}
`,
  );

program.parse(process.argv);

const options = program.opts();
const projectNameArg = program.args[0];

function validateFlags(): void {
  if (options.frontend && !['vue', 'react'].includes(options.frontend)) {
    logError(`Invalid frontend: "${options.frontend}". Use "vue" or "react".`);
    process.exit(1);
  }
  if (options.backend && options.backend !== 'express') {
    logError(`Invalid backend: "${options.backend}". Only "express" is supported.`);
    process.exit(1);
  }
  if (options.database && !['drizzle', 'mongoose'].includes(options.database)) {
    logError(`Invalid database: "${options.database}". Use "drizzle" or "mongoose".`);
    process.exit(1);
  }
}

async function main() {
  try {
    validateFlags();

    let answers: import('./prompts.js').CliAnswers;

    const defaults = {
      frontend: 'vue' as const,
      backend: 'express' as const,
      orm: 'drizzle' as const,
    };

    if (options.yes) {
      answers = {
        projectName: projectNameArg || 'my-fullstack-app',
        frontend: options.frontend || defaults.frontend,
        backend: options.backend || defaults.backend,
        orm: options.database || defaults.orm,
      };
    } else {
      answers = projectNameArg
        ? await runPrompts(projectNameArg)
        : await runPrompts();

      if (options.frontend) answers.frontend = options.frontend;
      if (options.backend) answers.backend = options.backend;
      if (options.database) answers.orm = options.database;
    }

    const spinner = createSpinner('Preparing your fullstack project...');
    spinner.start();
    spinner.succeed();

    await scaffoldProject(answers);
  } catch (error) {
    logError(`Something went wrong: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
