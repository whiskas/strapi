import { defineConfig } from 'rollup';
import path from 'path';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig([
  {
    input: import.meta.dirname + '/src/index.ts',
    external: (id) => !path.isAbsolute(id) && !id.startsWith('.'),
    output: [
      {
        file: import.meta.dirname + '/dist/index.js',
        exports: 'named',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: import.meta.dirname + '/dist/index.mjs',
        exports: 'named',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      json(),
      nodeResolve({
        extensions: ['.ts'],
      }),
      commonjs({
        ignoreDynamicRequires: true,
      }),
      swc({
        swc: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: false, // Set to true if using TSX
            },
            target: 'es2020',
          },
          sourceMaps: true,
        },
      }),
    ],
  },
]);
