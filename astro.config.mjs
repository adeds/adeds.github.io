// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://adeds.github.io',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
});
