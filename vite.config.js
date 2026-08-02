import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Prefixos que hoje existem na API FastAPI (veja src/infra/router/routers.py
// no backend). Em dev, o Vite encaminha essas chamadas para o backend
// rodando em localhost:8000, então o browser enxerga tudo como uma origem
// só — evita todo o problema de cookie cross-site em dev.
const BACKEND_URL = "http://localhost:8000";
const BACKEND_PREFIXES = ["/user", "/campanhas", "/vendas", "/times", "/media"];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      BACKEND_PREFIXES.map((prefix) => [
        prefix,
        { target: BACKEND_URL, changeOrigin: true },
      ]),
    ),
  },
});
