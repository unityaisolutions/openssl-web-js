import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import wasm from 'rollup-plugin-wasm';
import pkg from './package.json';

export default [
  // Browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'OpenSSLWasmJS',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      wasm(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.ts']
      }),
      terser()
    ]
  },

  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/index.ts',
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    plugins: [
      wasm(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' })
    ]
  },

  // TypeScript declaration files
  {
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'es'
    },
    plugins: [dts()]
  }
];
