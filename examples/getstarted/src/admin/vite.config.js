// vite.config.ts
import Inspect from 'vite-plugin-inspect';
import renderSvelteApp from './vite-plugin-svelte-render';
import { svelte } from './@sveltejs/vite-plugin-svelte/src/index';

const { mergeConfig } = require('vite');

module.exports = (config, ctx) => {
  // Important: always return the modified config
  // debugger;
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      renderSvelteApp(ctx), // сейчас работает для дев-сервера
      svelte({
        // Enable SSR mode
        // compilerOptions: { },
      }),
      Inspect({
        bundle: true,
        outputDir: '.vite-inspect'
      }), // port: 5173,  localhost:5173/__inspect
    ],
    server: { middlewareMode: 'ssr' }
  });
};
