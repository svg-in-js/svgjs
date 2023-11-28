import path from 'path';
import ts from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

const pkgJson = require('./package.json');

let hasTSChecked = false;
const outputConfigs = {
  cjs: {
    file: path.resolve(__dirname, `dist/index.js`),
    format: `cjs`
  },
  es: {
    file: path.resolve(__dirname, `dist/index.es.js`),
    format: `es`
  }
};

const defaultFormats = ['cjs', 'es'];
const packageFormats = defaultFormats;
const packageConfigs = packageFormats.map(format => createConfig('src/index.ts', outputConfigs[format]));

packageConfigs.push(createConfig('src/cli.ts', {
  file: path.resolve(__dirname, `dist/cli.cjs.js`),
  format: `cjs`
}));

export default packageConfigs;

function createConfig(input, output = {}, plugins = []) {
  output.externalLiveBindings = false;

  const shouldEmitDeclarations = !hasTSChecked;

  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    tsconfigOverride: {
      compilerOptions: {
        declaration: shouldEmitDeclarations,
      },
      exclude: ['**/__tests__', 'test-dts'],
    },
  });
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true;

  // the browser builds of @vue/compiler-sfc requires postcss to be available
  // as a global (e.g. http://wzrd.in/standalone/postcss)
  const nodePlugins = [
    require('@rollup/plugin-node-resolve').nodeResolve({
      preferBuiltins: true
    }),
    require('@rollup/plugin-commonjs')({
      sourceMap: false,
    }),
  ];

  return {
    external: [...Object.keys(pkgJson.dependencies || {}), './index', '../package.json'],
    input,
    plugins: [
      json({
        namedExports: false
      }),
      ...nodePlugins,
      ...plugins,
      tsPlugin,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  }
}
