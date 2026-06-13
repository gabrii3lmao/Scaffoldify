export interface VueOptions {
  projectName: string;
}

export function vuePackageJson(opts: VueOptions): string {
  return JSON.stringify(
    {
      name: `${opts.projectName}-web`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vue-tsc --noEmit && vite build',
        preview: 'vite preview',
        lint: 'eslint src/ --ext .vue,.ts',
        format: 'prettier --write "src/**/*.{vue,ts,css}"',
      },
      dependencies: {
        vue: '^3.5.0',
        'vue-router': '^4.4.0',
        pinia: '^2.2.0',
        '@tanstack/vue-query': '^5.62.0',
        axios: '^1.7.0',
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.2.0',
        'vite': '^6.0.0',
        'vue-tsc': '^2.1.0',
        'typescript': '^5.7.0',
        '@types/node': '^22.10.0',
        'tailwindcss': '^4.0.0',
        '@tailwindcss/vite': '^4.0.0',
        'eslint': '^9.15.0',
        'prettier': '^3.4.0',
      },
    },
    null,
    2,
  );
}

export function vueViteConfig(): string {
  return `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
`;
}

export function vueIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ projectName }}</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  </head>
  <body class="min-h-screen bg-gray-50 text-gray-900 antialiased">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}

export function vueMainTs(): string {
  return `import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import { router } from './router';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin);

app.mount('#app');
`;
}

export function vueAppVue(): string {
  return `<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <router-view />
</template>
`;
}

export function vueStyleCss(): string {
  return `@import "tailwindcss";

body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}
`;
}

export function vueRouter(): string {
  return `import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
`;
}

export function vueCounterStore(): string {
  return `import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = 0;
  }

  return { count, doubleCount, increment, decrement, reset };
});
`;
}

export function vueApiClient(): string {
  return `import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
`;
}

export function vueUserApi(): string {
  return `import apiClient from './client';

export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  bio?: string;
}

export const userApi = {
  async findAll() {
    const { data } = await apiClient.get<{ data: User[] }>('/users');
    return data.data;
  },

  async findById(id: number) {
    const { data } = await apiClient.get<{ data: User }>(\`/users/\${id}\`);
    return data.data;
  },

  async create(dto: CreateUserDto) {
    const { data } = await apiClient.post<{ data: User }>('/users', dto);
    return data.data;
  },

  async update(id: number, dto: Partial<CreateUserDto>) {
    const { data } = await apiClient.put<{ data: User }>(\`/users/\${id}\`, dto);
    return data.data;
  },

  async delete(id: number) {
    await apiClient.delete(\`/users/\${id}\`);
  },
};
`;
}

export function vueHomeView(): string {
  return `<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';
import { userApi } from '@/api/users';
import { useCounterStore } from '@/stores/counter';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const store = useCounterStore();

const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => userApi.findAll(),
});
</script>

<template>
  <DefaultLayout>
    <div class="space-y-8">
      <section class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">Welcome to Fullstack CLI App</h1>
        <p class="mt-2 text-gray-600">Scaffolded with Vue 3 + Express + Drizzle</p>
      </section>

      <section class="rounded-xl border bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold">Pinia Counter</h2>
        <p class="text-3xl font-bold">{{ store.count }}</p>
        <p class="text-sm text-gray-500">Double: {{ store.doubleCount }}</p>
        <div class="mt-3 flex gap-2">
          <button @click="store.decrement()" class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">-</button>
          <button @click="store.increment()" class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">+</button>
          <button @click="store.reset()" class="rounded bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200">Reset</button>
        </div>
      </section>

      <section class="rounded-xl border bg-white p-6 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold">Users (TanStack Query)</h2>
        <p v-if="isLoading" class="text-gray-400">Loading...</p>
        <ul v-else class="divide-y">
          <li v-for="user in users" :key="user.id" class="py-2">
            <p class="font-medium">{{ user.name }}</p>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
          </li>
        </ul>
      </section>
    </div>
  </DefaultLayout>
</template>
`;
}

export function vueAboutView(): string {
  return `<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
</script>

<template>
  <DefaultLayout>
    <div class="prose mx-auto max-w-2xl">
      <h1>About</h1>
      <p>This project was generated with <strong>scaffoldify</strong>.</p>
      <h2>Tech Stack</h2>
      <ul>
        <li>Vue 3 + Vite</li>
        <li>Pinia (State Management)</li>
        <li>TanStack Query (Server State)</li>
        <li>TailwindCSS 4</li>
        <li>Axios (HTTP Client)</li>
        <li>Vue Router</li>
      </ul>
    </div>
  </DefaultLayout>
</template>
`;
}

export function vueDefaultLayout(): string {
  return `<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b bg-white">
      <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <RouterLink to="/" class="text-xl font-bold">Fullstack App</RouterLink>
        <div class="flex gap-4">
          <RouterLink to="/" class="text-gray-600 hover:text-gray-900">Home</RouterLink>
          <RouterLink to="/about" class="text-gray-600 hover:text-gray-900">About</RouterLink>
        </div>
      </nav>
    </header>
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <slot />
    </main>
    <footer class="border-t bg-white py-4 text-center text-sm text-gray-500">
      &copy; {{ new Date().getFullYear() }} Fullstack CLI App
    </footer>
  </div>
</template>
`;
}
