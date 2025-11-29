import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// Vite config optimized for long-term maintainability
export default defineConfig({
  plugins: [react()],
  base: '/pbft-visualizer/',
});