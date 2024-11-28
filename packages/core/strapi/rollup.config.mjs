import { defineConfig } from 'rollup';
import path from 'path';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig([
  {
    input: {
      index: import.meta.dirname + '/src/index.ts',
      cli: import.meta.dirname + '/src/cli/index.ts',
      admin: import.meta.dirname + '/src/admin.ts',
      'admin-test': import.meta.dirname + '/src/admin-test.ts',
    },
    external: (id) => !path.isAbsolute(id) && !id.startsWith('.'),
    output: [
      {
        dir: import.meta.dirname + '/dist',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: import.meta.dirname + '/dist',
        entryFileNames: '[name].mjs',
        chunkFileNames: 'chunks/[name]-[hash].js',
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
