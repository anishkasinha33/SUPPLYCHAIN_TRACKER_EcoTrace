import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests to /api go to the EcoTrace backend (folder backend/, default port 4000), so the browser sees a
// single origin and the HTTP-only login cookie works without any extra CORS setup.
const api = { '/api': 'http://localhost:4000' };

export default defineConfig({ plugins: [react()], server: { proxy: api }, preview: { proxy: api } });
