import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No desenvolvimento, tudo que o front chamar em /api/... é repassado para o backend
// (http://localhost:8080/...). Assim não depende de CORS enquanto desenvolvemos.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
