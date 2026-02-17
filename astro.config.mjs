import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tinaDirective from './astro-tina-directive/register.js';

export default defineConfig({
  output: 'static',
  integrations: [react(), tinaDirective()],
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
            warning.exporter === 'tinacms/dist/client'
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
  },
});
