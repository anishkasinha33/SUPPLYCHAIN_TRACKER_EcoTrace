import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite runs inside the Express server (server/index.js), so there is no separate dev server or proxy.
export default defineConfig({ plugins: [react()] });
