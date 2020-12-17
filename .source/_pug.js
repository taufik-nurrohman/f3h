import {getFile, getFiles, moveFile, parseFile, setFile, setFolder} from './_h.js';

import {basename, dirname, extname} from 'path';
import {compile} from 'pug';

const state = JSON.parse(getFile('package.json'));

delete state.scripts;

getFiles('.source').forEach(file => {
    if ('.pug' === extname(file) && !/^[_.]/.test(basename(file))) {
        let content = compile(getFile(file), {
            basedir: '.source',
            doctype: 'html',
            filename: file // What is this for by the way?
        });
        file = file.replace(/^\.source\/|\.pug$/g, "");
        file += extname(file) ? "" : '.html';
        setFolder(dirname(file));
        setFile(file, parseFile(content(state), state));
    }
    moveFile('example-5/log.html', 'example-5/log');
});
