import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_WEB_PORT) || 5173;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: port,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/db.json', '**/node_modules/**']
      },
    }
  }
});