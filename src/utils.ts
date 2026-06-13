import ora from 'ora';
import pc from 'picocolors';

const BORDER = pc.cyan('─');
const CORNER_TL = pc.cyan('╭');
const CORNER_TR = pc.cyan('╮');
const CORNER_BL = pc.cyan('╰');
const CORNER_BR = pc.cyan('╯');

export function showWelcomeBanner(): void {
  console.log(
    `\n${pc.bold(pc.cyan('  ╔══════════════════════════════════════╗'))}
${pc.bold(pc.cyan('  ║'))}  ${pc.bold('Scaffoldify')} ${pc.dim('v1.0.0')}          ${pc.bold(pc.cyan('║'))}
${pc.bold(pc.cyan('  ║'))}  ${pc.dim('Scaffold production-ready')}        ${pc.bold(pc.cyan('║'))}
${pc.bold(pc.cyan('  ║'))}  ${pc.dim('fullstack boilerplates')}           ${pc.bold(pc.cyan('║'))}
${pc.bold(pc.cyan('  ╚══════════════════════════════════════╝'))}\n`,
  );
}

export function createSpinner(text: string) {
  return ora({ text, color: 'cyan', spinner: 'dots' });
}

export function logSuccess(msg: string) {
  console.log(`${pc.green('✔')} ${pc.green(msg)}`);
}

export function logInfo(msg: string) {
  console.log(`${pc.cyan('ℹ')} ${pc.cyan(msg)}`);
}

export function logWarning(msg: string) {
  console.log(`${pc.yellow('⚠')} ${pc.yellow(msg)}`);
}

export function logError(msg: string) {
  console.log(`${pc.red('✖')} ${pc.red(msg)}`);
}

export function logStep(step: number, total: number, msg: string) {
  console.log(`\n${pc.bold(pc.cyan(`┃ [${step}/${total}]`))} ${pc.bold(msg)}`);
  console.log(pc.dim('─'.repeat(50)));
}

export function highlight(text: string): string {
  return pc.cyan(text);
}

export function printSummaryBox(projectName: string, frontend: string, orm: string): void {
  const line = `  ${CORNER_TL}${BORDER.repeat(46)}${CORNER_TR}`;
  const lineEnd = `  ${CORNER_BL}${BORDER.repeat(46)}${CORNER_BR}`;
  const bar = `  ${pc.cyan('│')}`;

  const lines = [
    '',
    pc.green('  ✨ Project generated successfully!'),
    '',
    line,
    `${bar}  ${pc.bold('Summary')}`,
    `${bar}  ${pc.dim('Project:')}    ${projectName}`,
    `${bar}  ${pc.dim('Frontend:')}   ${frontend === 'vue' ? 'Vue 3 + Vite' : 'Next.js 15'}`,
    `${bar}  ${pc.dim('Backend:')}    Express + TypeScript`,
    `${bar}  ${pc.dim('Database:')}   ${orm === 'drizzle' ? 'PostgreSQL (Drizzle ORM)' : 'MongoDB (Mongoose)'}`,
    lineEnd,
    '',
    `  ${pc.bold('Next steps:')}`,
    '',
    `    ${pc.cyan('$')}  ${pc.bold(`cd ${projectName}`)}`,
    `    ${pc.cyan('$')}  cd backend`,
    `    ${pc.cyan('$')}  ${pc.bold('docker compose up -d')}         ${pc.dim('# Start database')}`,
    `    ${pc.cyan('$')}  npm run dev                       ${pc.dim('# Start dev server')}`,
    '',
    `    ${pc.dim('API docs:')}  ${pc.underline('http://localhost:3000/api-docs')}`,
    '',
  ];

  console.log(lines.join('\n'));
}

export function latestDeps(packages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.keys(packages).map((pkg) => [pkg, '*']));
}

export function projectNameToVar(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .replace(/__+/g, '_')
    .toLowerCase();
}

export function projectNameToPascal(name: string): string {
  return projectNameToVar(name)
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
