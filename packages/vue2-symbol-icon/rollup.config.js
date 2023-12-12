import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/svg-symbol-icon.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/svg-symbol-icon.es.js',
      format: 'es'
    },
    {
      file: 'dist/svg-symbol-icon.umd.js',
      format: 'umd',
      name: 'SvgSymbolIcon',
    }
  ],
  external: ['vue'],
  plugins: [
    resolve({ extensions: ['.vue', '.jsx'] }),
    commonjs(),
    vue(),
    babel()
  ]
}