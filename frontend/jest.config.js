module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/src/__tests__/**/*.test.jsx'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
};