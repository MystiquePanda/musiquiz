module.exports = {
  presets: [
    '@babel/react',
    [
      '@babel/env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/stage-2'
  ],
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
};
