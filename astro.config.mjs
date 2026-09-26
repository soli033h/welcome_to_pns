import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: netlify()
});