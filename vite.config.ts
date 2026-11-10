import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works on any static host.
export default defineConfig({
  base: "./",
  plugins: [react()],
  optimizeDeps: { exclude: ["@huggingface/transformers"] }, // keep ONNX wasm loading intact
  build: { chunkSizeWarningLimit: 7000 }, // big AI chunks are lazy-loaded
});
