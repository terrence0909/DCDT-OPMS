import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'http://localhost:5002',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react({
        // This ensures TypeScript files are handled correctly
        include: '**/*.{ts,tsx}',
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    css: {
      postcss: './postcss.config.cjs',
    },
    // Tell Vite to handle .ts files as source code, not assets
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg'],
  };
});
