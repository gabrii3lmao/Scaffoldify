export type { SharedOptions } from './shared.js';
export type { BackendOptions } from './backend.js';
export type { DrizzleOptions } from './drizzle.js';
export type { MongooseOptions } from './mongoose.js';
export type { VueOptions } from './vue.js';
export type { ReactOptions } from './react.js';
export type {
  ModuleField,
  ModuleDefinition,
  ModuleGeneratorOptions,
  FileEntry,
} from './backend-module.js';

export {
  envContent,
  envExampleContent,
  gitignoreContent,
  eslintConfigContent,
  prettierConfigContent,
  dockerfileBackendContent,
  dockerfileFrontendContent,
  composeContent,
} from './shared.js';

export {
  backendPackageJson,
  backendTsconfig,
  backendMainIndex,
  backendConfig,
  backendErrorMiddleware,
  backendSwagger,

  backendApiHttp,
} from './backend.js';

export {
  drizzleConfigContent,
  drizzleDbConnection,
  drizzleSchemaBarrel,
  drizzleMigrateScript,
} from './drizzle.js';

export {
  mongooseDbConnection,
} from './mongoose.js';

export {
  generateModuleFiles,
  USER_MODULE,

} from './backend-module.js';

export {
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
} from './vue.js';

export {
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
} from './react.js';
