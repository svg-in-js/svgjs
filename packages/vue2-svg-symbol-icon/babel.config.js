const presets = [
  [
    '@babel/preset-env',
    {
      modules: false,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 10']
      }
    }
  ],
  '@vue/babel-preset-jsx'
];

module.exports = {
  presets
};