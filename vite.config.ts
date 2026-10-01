import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    assetsInclude: ["**/*.hdr", "**/*.exr", "**/*.glb", "**/*.gltf", "**/*.ktx2", "**/*.bin"],
  },
});
