import { defineConfig } from 'vite';

// The 3d.city game is served as-is from public/3dcity (static files, no bundling).
export default defineConfig({
  base: './',
  server: { host: '::', port: 8080, strictPort: true },
  build: { target: 'esnext', sourcemap: false },
});
