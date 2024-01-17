import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      inlineDynamicImports: true,
      file: 'dist/svg-symbol-icon.cjs.js',
      format: 'cjs'
    },
    {
      inlineDynamicImports: true,
      file: 'dist/svg-symbol-icon.es.js',
      format: 'es'
    },
    {
      inlineDynamicImports: true,
      file: 'dist/svg-symbol-icon.umd.js',
      format: 'umd',
      name: 'SymbolIcon',
    }
  ],
  external: ['vue', 'tippy.js'],
  plugins: [
    resolve({ extensions: ['.vue', '.jsx'] }),
    commonjs(),
    vue(),
    babel(),
  ]
}