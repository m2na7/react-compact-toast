const esbuild = require('esbuild');
const cssModulesPlugin = require('esbuild-css-modules-plugin');

esbuild.build({
  entryPoints: ['index.ts'],
  target: ['es5', 'es6', 'es2017'],
  bundle: true,
  sourcemap: false,
  minify: true,
  format: 'cjs',
  platform: 'browser',
  jsx: 'automatic',
  outfile: 'index.js',
  tsconfig: './tsconfig.package.json',
  treeShaking: true,
  external: ['react-dom', 'react'],
  plugins: [
    cssModulesPlugin({
      inject: true,
      localsConvention: 'dashes',
      filter: /\.module?\.css$/i,
      v2: false,
    }),
  ],
});
