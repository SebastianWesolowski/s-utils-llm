import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const input = 'src/index.ts';

export default [
  // ESM build
  {
    input,
    output: {
      file: 'lib/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    external: ['openai'],
    plugins: [
      json(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
  // CommonJS build
  {
    input,
    output: {
      file: 'lib/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['openai'],
    plugins: [
      json(),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'tsconfig.build.json',
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
];
