import * as file from '@taufik-nurrohman/file';
import * as folder from '@taufik-nurrohman/folder';

import {rollup} from 'rollup';
import {babel} from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

import {minify} from 'terser';

const c = {
    input: '.source/index.mjs',
    output: {
        file: 'index.js',
        format: 'umd',
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
        resolve()
    ]
};

let license = '/*!\n *\n * ' + file.getContent('LICENSE').trim().replace(/\n/g, '\n * ').replace(/\n \* \n/g, '\n *\n') + '\n *\n */';

(async () => {
    const factory = await rollup(c);
    const state = JSON.parse(file.getContent('package.json'));
    await factory.write(c.output);
    await factory.close();
    state.rollup = c;
    delete state.scripts;
    // Generate browser module…
    let content = file.getContent(c.output.file);
    content = license + '\n\n' + file.parseContent(content, state);
    file.setContent(c.output.file, content);
    minify(content, {
        compress: {
            unsafe: true
        }
    }).then(result => {
        file.setContent(c.output.file.replace(/\.js$/, '.min.js'), result.code);
    });
    // Generate Node.js module…
    content = file.getContent('.source/index.mjs');
    content = license + '\n\n' + file.parseContent(content, state);
    file.setContent('index.mjs', content);
})();
