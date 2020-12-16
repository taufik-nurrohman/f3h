import babel from '@rollup/plugin-babel';
import license from 'rollup-plugin-license';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: '.source/mjs/index.mjs',
  output: {
    file: 'f3h.js',
    format: 'iife',
    name: 'F3H',
    sourcemap: false
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      plugins: [
        [
          '@babel/plugin-proposal-class-properties',
          {
            loose: true
          }
        ],
        [
          '@babel/plugin-proposal-private-methods',
          {
            loose: true
          }
        ]
      ],
      presets: [
        [
          '@babel/preset-env',
          {
            loose: true,
            modules: false,
            targets: '>0.25%'
          }
        ]
      ]
    }),
    license({
      banner: {
        content: `==============================================================
F3H <%= pkg.version %>
==============================================================
Author: Taufik Nurrohman <https://github.com/taufik-nurrohman>
License: MIT
--------------------------------------------------------------`,
        commentStyle: 'ignored'
      }
    }),
    resolve()
  ]
};
