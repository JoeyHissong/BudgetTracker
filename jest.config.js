module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // The default preset only transforms react-native-prefixed packages inside
  // node_modules. These two ship ESM and need transforming too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-documents|@dr\\.pogodin)/)',
  ],
};
