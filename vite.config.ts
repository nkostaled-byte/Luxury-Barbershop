import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy /api requests to the Cloudflare Worker during local dev so the
      // frontend doesn't need VITE_API_BASE_URL to be set. All requests to
      // /api/* are forwarded to the deployed worker, avoiding CORS issues
      // and the "SPA fallback returns HTML instead of JSON" problem.
      proxy: {
        '/api': {
          target: 'https://mygrafix-dashboard-worker.mygrafix.workers.dev',
          changeOrigin: true,
        },
      },
    },
  };
});
