import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const PRODUCTION_API_URL = "https://api.tiagoegabriela.com.br/api";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL?.trim() || (mode === "production" ? PRODUCTION_API_URL : "/api");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    server: {
      // 3001 porque a 3000 costuma estar ocupada por outros projetos (ex.: WMS);
      // manter em sincronia com PORT no backend/.env
      proxy: {
        "/api": "http://localhost:3001",
        "/uploads": "http://localhost:3001",
      },
    },
  };
});
