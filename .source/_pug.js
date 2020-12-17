import {getFile, getFiles, moveFile, setFile, setFolder} from './_h.js';
import getState from 'read-package-json';

import {basename, dirname, extname} from 'path';
import {compile} from 'pug';

getState('package.json', console.error, false, (error, state) => {
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
            setFile(file, content(state));
        }
        moveFile('example-5/log.html', 'example-5/log');
    });
});
