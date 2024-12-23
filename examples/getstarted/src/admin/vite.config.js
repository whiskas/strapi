// vite.config.ts
import Inspect from 'vite-plugin-inspect';
import {buildZeroFilesPlugin} from './vite-plugin-zero'
import viteHandlebarsPrecompilePlugin from './vite-plugin-handlebars-precompile';
import { svelte } from './@sveltejs/vite-plugin-svelte/src/index';

const { mergeConfig } = require('vite');

module.exports = (config, ctx) => {
  // Important: always return the modified config
  debugger;
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      buildZeroFilesPlugin(ctx),
      viteHandlebarsPrecompilePlugin(),
      svelte(),
      Inspect({
        bundle: true,
        outputDir: '.vite-inspect'
      }), // port: 5173,  localhost:5173/__inspect
    ],
  });
};
