import resolve from 'rollup-plugin-node-resolve';
import vue from 'rollup-plugin-vue';
import ts from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss'; 

export default {
  input: 'src/index.ts',
  output: [
    {
      inlineDynamicImports: true,
      file: 'dist/svg-symbol-icon.es.js',
      format: 'es'
    },
  ],
  external: ['vue', 'tippy.js'],
  plugins: [
    resolve({ extensions: ['.vue', '.ts'] }),
    vue({
      preprocessStyles: true
    }),
    postcss(),
    ts({
      tsconfig: require('path').resolve(__dirname, './tsconfig.json'),
      check: false,
    }),
  ]
}