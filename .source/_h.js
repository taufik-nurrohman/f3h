// Helper function(s)

import {mkdirSync, readdirSync, readFileSync, rename, statSync, writeFileSync} from 'fs';
import {join} from 'path';

export const getFile = path => readFileSync(path, 'utf8');

export const getFiles = path => {
    return readdirSync(path).reduce((results, result) => {
        const f = join(path, result);
        const d = statSync(f).isDirectory();
        return d ? [...results, ...getFiles(f)] : [...results, f];
    }, []);
};

export const moveFile = (from, to) => rename(from, to, () => {});

export const parseFile = (content, state) => {
    return content.replace(/%\((\S+)\)/g, (m0, m1) => {
        // <https://stackoverflow.com/a/6394168>
        return m1.split('.').reduce((o, k) => o[k], state);
    });
};

export const setFile = (path, content, mode = 0o777) => writeFileSync(path, content, 'utf8');

export const setFolder = path => mkdirSync(path, {
    recursive: true
});
