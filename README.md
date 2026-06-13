# Scaffoldify

A CLI tool to scaffold production-ready fullstack boilerplates with a modular domain-driven architecture.

## Features

- **Interactive prompts** or **flag-driven** setup
- **Frontend**: Vue 3 (Vite + Pinia + TanStack Query + TailwindCSS 4) or Next.js 15 (React 19 + Zustand + TanStack Query + TailwindCSS 4)
- **Backend**: Express with TypeScript, modular domain-driven structure
- **Database**: Drizzle ORM (PostgreSQL) or Mongoose (MongoDB)
- **Docker**: Multi-stage Dockerfiles + unified `compose.yaml` with health-checked database
- **API docs**: Swagger auto-generated from route decorators
- **Linting**: ESLint + Prettier configs included
- **REST client**: Pre-configured `api.http` file for testing endpoints
- **No DI framework**: Simple constructor injection with manual wiring

## Usage

```bash
# Interactive mode
npx scaffoldify my-project

# Non-interactive with defaults
npx scaffoldify my-project --yes

# Flag-driven
npx scaffoldify my-project -f react -d mongoose
```

### Options

| Flag | Description |
|------|-------------|
| `-f, --frontend <framework>` | Frontend framework: `vue` or `react` |
| `-b, --backend <framework>` | Backend framework: `express` (only option) |
| `-d, --database <orm>` | Database ORM: `drizzle` or `mongoose` |
| `-y, --yes` | Skip prompts and use defaults |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## Generated Structure

```
my-project/
├── backend/
│   ├── src/
│   │   ├── index.ts                         # App entry point
│   │   ├── modules/
│   │   │   └── user/                        # Domain module example
│   │   │       ├── user.controller.ts       # HTTP handlers
│   │   │       ├── user.service.ts          # Business logic
│   │   │       ├── user.routes.ts           # Route definitions + Swagger
│   │   │       ├── user.repository.ts       # Data access layer
│   │   │       └── user.schema.ts           # Drizzle table / Mongoose model
│   │   └── shared/
│   │       ├── config/index.ts              # Environment configuration
│   │       ├── middleware/error.middleware.ts
│   │       ├── database/
│   │       │   ├── index.ts                 # Database connection
│   │       │   ├── schema.ts                # Barrel re-export of module schemas
│   │       │   └── migrate.ts               # Migration runner (Drizzle)
│   │       └── swagger.ts                   # Swagger setup
│   ├── compose.yaml                         # Docker Compose (app + database)
│   ├── Dockerfile                           # Multi-stage production build
│   ├── drizzle.config.ts                    # Drizzle Kit config
│   ├── api.http                             # REST client test file
│   ├── .env / .env.example
│   ├── .eslintrc.json / .prettierrc
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                             # Axios client + endpoint modules
│   │   ├── components/                      # Shared components
│   │   ├── layouts/                         # Layout components (Vue)
│   │   ├── views/                           # Page views (Vue)
│   │   ├── stores/                          # Pinia stores (Vue) / Zustand (React)
│   │   ├── router/                          # Vue Router (Vue)
│   │   └── app/                             # App directory (Next.js)
│   └── package.json
└── compose.yaml
```

## Getting Started (after scaffolding)

```bash
cd my-project
cd backend && npm install
cd ../frontend && npm install
cd .. && docker compose -f backend/compose.yaml up -d
```

The API will be available at `http://localhost:3000` and API docs at `http://localhost:3000/api-docs`.

## Adding a New Module

1. Define the module in `src/templates/backend-module.ts` using `ModuleDefinition`
2. Add it to the `MODULES` array in `src/scaffolder.ts`

```typescript
export const PRODUCT_MODULE: ModuleDefinition = {
  name: 'product',
  pascal: 'Product',
  plural: 'products',
  fields: [
    { name: 'title', type: 'string', required: true },
    { name: 'description', type: 'text' },
    { name: 'price', type: 'string', required: true },
    { name: 'isPublished', type: 'boolean' },
  ],
};
```

The module generator produces controller, service, routes, repository, and schema files automatically.

## Development

```bash
git clone <repo>
cd scaffoldify
npm install
npm run build
npm link
scaffoldify my-test-project --yes
```

## License

MIT
