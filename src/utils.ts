import ora from 'ora';
import pc from 'picocolors';

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
  console.log(`\n${pc.bold(pc.cyan(`[${step}/${total}]`))} ${pc.bold(msg)}`);
}

export function highlight(text: string): string {
  return pc.cyan(text);
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
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}
