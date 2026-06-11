import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" keeps asset and data URLs relative so the static build works on
// Vercel, Cloudflare Pages, GitHub Pages subpaths, and HF Spaces static alike.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
