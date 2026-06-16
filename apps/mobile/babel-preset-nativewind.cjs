/** NativeWind css-interop preset without react-native-worklets (Reanimated 3 / RN 0.76). */
module.exports = function () {
  return {
    plugins: [
      'react-native-css-interop/dist/babel-plugin',
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          importSource: 'react-native-css-interop',
        },
      ],
    ],
  };
};
