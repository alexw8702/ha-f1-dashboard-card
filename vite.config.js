import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      // Styles werden ins Shadow DOM der Custom Elements inline injiziert
      customElement: true,
    }),
  ],
  define: {
    // Vue Produktions-Flags für Lib-Build
    'process.env.NODE_ENV': JSON.stringify('production'),
    '__VUE_OPTIONS_API__': 'false',
    '__VUE_PROD_DEVTOOLS__': 'false',
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'false',
  },
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'F1DashboardCards',
      formats: ['iife'],
      fileName: () => 'f1-dashboard-card.js',
    },
    outDir: 'dist',
    minify: 'esbuild',
  },
})
