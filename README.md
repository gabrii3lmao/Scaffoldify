<p align="center">
  <img src="https://img.shields.io/badge/status-under%20development-yellow?style=for-the-badge" alt="Under Development">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License">
</p>

<div align="center">
  <h1>⚡ Scaffoldify</h1>
  <p><strong>Scaffold production-ready fullstack apps in seconds</strong></p>
  <p>
    <code>npx scaffoldify my-project</code>
  </p>
</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h4>🎯 Interactive & Flag-Driven</h4>
      <p>Guided prompts or <code>--yes</code> for CI pipelines</p>
    </td>
    <td width="50%">
      <h4>🧩 Modular Architecture</h4>
      <p>Domain-driven modules, not flat folders</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚛️ Frontend Choices</h4>
      <p><strong>Vue 3</strong> (Vite + Pinia + TanStack Query + TailwindCSS 4) or <strong>Next.js 15</strong> (React 19 + Zustand + TanStack Query)</p>
    </td>
    <td>
      <h4>🖥️ Backend</h4>
      <p>Express + TypeScript with layered services and Swagger</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>🗄️ Database Options</h4>
      <p><strong>Drizzle ORM</strong> (PostgreSQL) or <strong>Mongoose</strong> (MongoDB)</p>
    </td>
    <td>
      <h4>🐳 Docker Ready</h4>
      <p>Multi-stage Dockerfiles + compose.yaml with database health checks</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>📦 Auto Install</h4>
      <p>Runs <code>npm install</code> with latest versions automatically</p>
    </td>
    <td>
      <h4>📝 API Docs</h4>
      <p>Swagger auto-generated from route decorators</p>
    </td>
  </tr>
</table>

---

## 🚀 Quick Start

```bash
npx scaffoldify my-app
cd my-app/backend
docker compose up -d
npm run dev
```

Open **http://localhost:3000/api-docs** for your Swagger documentation.

---

## 📦 Installation

```bash
# Run directly (no install needed)
npx scaffoldify my-app

# Or install globally
npm install -g scaffoldify
scaffoldify my-app
```

---

## 🎮 Usage

```bash
# Interactive wizard
scaffoldify my-project

# Skip prompts with defaults (Vue + Express + Drizzle)
scaffoldify my-project --yes

# Fully flag-driven
scaffoldify my-project -f react -d mongoose
```

### Options

| Flag | Description | Values |
|------|-------------|--------|
| `-f, --frontend` | Frontend framework | `vue` (default), `react` |
| `-b, --backend` | Backend framework | `express` |
| `-d, --database` | Database ORM | `drizzle` (default), `mongoose` |
| `-y, --yes` | Use all defaults | — |
| `-v, --version` | Show CLI version | — |
| `-h, --help` | Show help | — |

---

## 📁 Generated Structure

```
my-project/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── modules/
│   │   │   └── user/                  # 🔹 Domain module
│   │   │       ├── user.controller.ts
│   │   │       ├── user.service.ts
│   │   │       ├── user.routes.ts
│   │   │       ├── user.repository.ts
│   │   │       └── user.schema.ts
│   │   └── shared/
│   │       ├── config/
│   │       ├── middleware/
│   │       ├── database/
│   │       └── swagger.ts
│   ├── compose.yaml
│   ├── Dockerfile
│   ├── api.http
│   ├── .env / .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── router/                    # Vue only
│   │   └── app/                       # Next.js only
│   └── package.json
```

---

## 🧩 Adding a New Module

Define it in `src/templates/backend-module.ts` and add to the `MODULES` array in `src/scaffolder.ts`:

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

The generator produces controller, service, routes, repository, and schema files automatically.

---

## 🛠️ Development

```bash
git clone https://github.com/your-username/scaffoldify.git
cd scaffoldify
npm install
npm run build
npm link
scaffoldify my-test-project --yes
```

---

## 📄 License

MIT © [Gabriel](https://github.com/gabrii3lmao)

---

<p align="center">
  <sub>Built with ❤️ using TypeScript • Commander • Inquirer • Ora • Picocolors</sub>
</p>
