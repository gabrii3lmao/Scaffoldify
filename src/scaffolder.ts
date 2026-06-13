import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { createSpinner, logSuccess, logInfo, logStep } from './utils.js';
import type { CliAnswers } from './prompts.js';
import {
  envContent,
  envExampleContent,
  gitignoreContent,
  eslintConfigContent,
  prettierConfigContent,
  dockerfileBackendContent,
  dockerfileFrontendContent,
  composeContent,
  backendPackageJson,
  backendTsconfig,
  backendMainIndex,
  backendConfig,
  backendErrorMiddleware,
  backendSwagger,
  backendApiHttp,
  drizzleConfigContent,
  drizzleDbConnection,
  drizzleSchemaBarrel,
  drizzleMigrateScript,
  mongooseDbConnection,
  generateModuleFiles,
  USER_MODULE,
  vuePackageJson,
  vueViteConfig,
  vueIndexHtml,
  vueMainTs,
  vueAppVue,
  vueStyleCss,
  vueRouter,
  vueCounterStore,
  vueApiClient,
  vueUserApi,
  vueHomeView,
  vueAboutView,
  vueDefaultLayout,
  reactPackageJson,
  reactNextConfig,
  reactTsconfig,
  reactPostcssConfig,
  reactGlobalsCss,
  reactLayoutTsx,
  reactProviders,
  reactHomePage,
  reactCounterStore,
  reactApiClient,
  reactUserApi,
} from './templates/index.js';

interface FileEntry {
  path: string;
  content: string;
}

const MODULES = [USER_MODULE];

export async function scaffoldProject(answers: CliAnswers): Promise<string> {
  const { projectName, frontend, orm } = answers;
  const rootDir = path.resolve(process.cwd(), projectName);

  // ─── Create directories ──────────────────────────
  {
    const spinner = createSpinner('Setting up directories...');
    spinner.start();

    await fs.ensureDir(rootDir);
    await fs.ensureDir(path.join(rootDir, 'backend', 'src', 'shared', 'config'));
    await fs.ensureDir(path.join(rootDir, 'backend', 'src', 'shared', 'middleware'));
    await fs.ensureDir(path.join(rootDir, 'backend', 'src', 'shared', 'database'));

    for (const mod of MODULES) {
      await fs.ensureDir(path.join(rootDir, 'backend', 'src', 'modules', mod.name));
    }

    if (frontend === 'vue') {
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'views'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'layouts'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'components'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'stores'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'api'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'router'));
    } else {
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'app'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'components'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'store'));
      await fs.ensureDir(path.join(rootDir, 'frontend', 'src', 'api'));
    }

    spinner.succeed();
  }

  // ─── Backend files ───────────────────────────────
  {
    const spinner = createSpinner('Writing backend files...');
    spinner.start();

    const files: FileEntry[] = [
      { path: 'backend/package.json', content: backendPackageJson({ projectName, orm }) },
      { path: 'backend/tsconfig.json', content: backendTsconfig() },
      { path: 'backend/src/index.ts', content: backendMainIndex(MODULES, orm) },
      { path: 'backend/src/shared/config/index.ts', content: backendConfig() },
      { path: 'backend/src/shared/middleware/error.middleware.ts', content: backendErrorMiddleware() },
      { path: 'backend/src/shared/swagger.ts', content: backendSwagger(MODULES) },
      { path: 'backend/api.http', content: backendApiHttp(MODULES) },
      { path: 'backend/Dockerfile', content: dockerfileBackendContent() },
      { path: 'backend/.env', content: envContent({ projectName, orm }) },
      { path: 'backend/.env.example', content: envExampleContent({ projectName, orm }) },
      { path: 'backend/.gitignore', content: gitignoreContent() },
      { path: 'backend/.eslintrc.json', content: eslintConfigContent() },
      { path: 'backend/.prettierrc', content: prettierConfigContent() },
      { path: 'backend/compose.yaml', content: composeContent({ projectName, orm }) },
    ];

    if (orm === 'drizzle') {
      files.push(
        { path: 'backend/drizzle.config.ts', content: drizzleConfigContent(MODULES) },
        { path: 'backend/src/shared/database/index.ts', content: drizzleDbConnection() },
        { path: 'backend/src/shared/database/schema.ts', content: drizzleSchemaBarrel(MODULES) },
        { path: 'backend/src/shared/database/migrate.ts', content: drizzleMigrateScript() },
      );
    } else {
      files.push(
        { path: 'backend/src/shared/database/index.ts', content: mongooseDbConnection() },
      );
    }

    for (const mod of MODULES) {
      const moduleFiles = generateModuleFiles({ module: mod, orm });
      files.push(...moduleFiles);
    }

    await writeFiles(rootDir, files);
    spinner.succeed();
  }

  // ─── Frontend files ──────────────────────────────
  {
    const spinner = createSpinner(
      `Writing frontend files (${frontend === 'vue' ? 'Vue 3' : 'Next.js 15'})...`,
    );
    spinner.start();

    const files: FileEntry[] = [];

    if (frontend === 'vue') {
      files.push(
        { path: 'frontend/package.json', content: vuePackageJson({ projectName }) },
        { path: 'frontend/vite.config.ts', content: vueViteConfig() },
        { path: 'frontend/index.html', content: vueIndexHtml() },
        { path: 'frontend/src/main.ts', content: vueMainTs() },
        { path: 'frontend/src/App.vue', content: vueAppVue() },
        { path: 'frontend/src/style.css', content: vueStyleCss() },
        { path: 'frontend/src/router/index.ts', content: vueRouter() },
        { path: 'frontend/src/stores/counter.ts', content: vueCounterStore() },
        { path: 'frontend/src/api/client.ts', content: vueApiClient() },
        { path: 'frontend/src/api/users.ts', content: vueUserApi() },
        { path: 'frontend/src/views/HomeView.vue', content: vueHomeView() },
        { path: 'frontend/src/views/AboutView.vue', content: vueAboutView() },
        { path: 'frontend/src/layouts/DefaultLayout.vue', content: vueDefaultLayout() },
        { path: 'frontend/Dockerfile', content: dockerfileFrontendContent('vue') },
      );
    } else {
      files.push(
        { path: 'frontend/package.json', content: reactPackageJson({ projectName }) },
        { path: 'frontend/next.config.ts', content: reactNextConfig() },
        { path: 'frontend/tsconfig.json', content: reactTsconfig() },
        { path: 'frontend/postcss.config.mjs', content: reactPostcssConfig() },
        { path: 'frontend/src/app/globals.css', content: reactGlobalsCss() },
        { path: 'frontend/src/app/layout.tsx', content: reactLayoutTsx() },
        { path: 'frontend/src/app/page.tsx', content: reactHomePage() },
        { path: 'frontend/src/components/providers.tsx', content: reactProviders() },
        { path: 'frontend/src/store/counter.ts', content: reactCounterStore() },
        { path: 'frontend/src/api/client.ts', content: reactApiClient() },
        { path: 'frontend/src/api/users.ts', content: reactUserApi() },
        { path: 'frontend/Dockerfile', content: dockerfileFrontendContent('react') },
      );
    }

    await writeFiles(rootDir, files);
    spinner.succeed();
  }

  // ─── Install dependencies ────────────────────────
  {
    const backendDir = path.join(rootDir, 'backend');
    const frontendDir = path.join(rootDir, 'frontend');

    logInfo('Installing backend dependencies...');
    const backendInstall = createSpinner('Installing packages for backend...');
    backendInstall.start();
    try {
      execSync('npm install', { cwd: backendDir, stdio: 'pipe' });
      backendInstall.succeed();
    } catch {
      backendInstall.warn('Run "cd backend && npm install" manually');
    }

    logInfo('Installing frontend dependencies...');
    const frontendInstall = createSpinner('Installing packages for frontend...');
    frontendInstall.start();
    try {
      execSync('npm install', { cwd: frontendDir, stdio: 'pipe' });
      frontendInstall.succeed();
    } catch {
      frontendInstall.warn('Run "cd frontend && npm install" manually');
    }
  }

  return rootDir;
}

async function writeFiles(rootDir: string, files: FileEntry[]): Promise<void> {
  const writes = files.map((f) => {
    const fullPath = path.join(rootDir, f.path);
    return fs.outputFile(fullPath, f.content, 'utf-8');
  });
  await Promise.all(writes);
}
