import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // mais compatível no Vercel e local
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // garante que o alias funcione no build
    },
  },
  build: {
    outDir: "dist", // padrão para Vercel
    sourcemap: mode === "development", // ajuda debug local, não impacta produção
  },
}));
