// babel.config.js
module.exports = {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }], // Configura React preset para el nuevo runtime JSX
    '@babel/preset-typescript',
  ],
};
