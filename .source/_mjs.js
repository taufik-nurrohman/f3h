import {getFile, getFiles, parseFile, setFile, setFolder} from './_h.js';

import {rollup} from 'rollup';
import {babel} from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

import {minify} from 'terser';

const c = {
    input: '.source/index.mjs',
    output: {
        file: 'index.js',
        format: 'iife',
        name: 'F3H',
        sourcemap: false
    },
    plugins: [
        resolve(),
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
        })
    ]
};

let license = '/*!\n *\n * ' + getFile('LICENSE').trim().replace(/\n/g, '\n * ').replace(/\n \* \n/g, '\n *\n') + '\n *\n */';

(async () => {
    const factory = await rollup(c);
    const state = JSON.parse(getFile('package.json'));
    await factory.write(c.output);
    await factory.close();
    state.rollup = c;
    delete state.scripts;
    // Generate browser module…
    let content = getFile(c.output.file);
    content = license + '\n\n' + parseFile(content, state);
    setFile(c.output.file, content);
    minify(content, {
        compress: {
            unsafe: true
        }
    }).then(result => {
        setFile(c.output.file.replace(/\.js$/, '.min.js'), result.code);
    });
    // Generate Node.js module…
    content = getFile('.source/index.mjs');
    content = license + '\n\n' + parseFile(content, state);
    setFile('index.mjs', content);
})();
