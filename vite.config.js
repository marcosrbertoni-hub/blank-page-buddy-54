import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs so the build also works when served from a subpath
  // (GitHub Pages project sites, a reverse-proxied /game/ prefix, file://).
  base: './',
  server: {
    host: '::',
    port: 8080,
    strictPort: true,
    hmr: { overlay: false },
  },
  build: { target: 'esnext', sourcemap: false, chunkSizeWarningLimit: 4000 },
  assetsInclude: ['**/*.hdr', '**/*.exr', '**/*.glb', '**/*.gltf', '**/*.ktx2', '**/*.bin'],
});
