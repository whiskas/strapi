import { defineConfig } from 'rollup';
import path from 'path';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { execSync } from 'child_process';

const runTypeCheckAndDeclarations = () => {
  try {
    console.log('Running TypeScript type checking and declaration generation...');
    execSync('yarn type-gen', {
      stdio: 'inherit',
      cwd: import.meta.dirname,
    });
    console.log('Type declarations generated successfully.');
  } catch (error) {
    console.error('TypeScript compilation failed:', error);
    process.exit(1);
  }
};

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
      {
        name: 'typescript',
        buildStart() {
          runTypeCheckAndDeclarations();
        },
      },
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
