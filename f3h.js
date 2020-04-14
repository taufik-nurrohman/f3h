/*!
 * ==============================================================
 *  F3H (FETCH) 0.0.0
 * ==============================================================
 * Author: Taufik Nurrohman <https://github.com/taufik-nurrohman>
 * License: MIT
 * --------------------------------------------------------------
 */

(function(win, doc, name) {

    var instances = 'instances';

    function attributeGet(node, attr) {
        return node.getAttribute(attr);
    }

    function doPreventDefault(e) {
        e.preventDefault();
    }

    function eventLet(node, name, fn) {
        node.removeEventListener(name, fn);
    }

    function eventSet(node, name, fn) {
        node.addEventListener(name, fn, false);
    }

    function isFunction(x) {
        return 'function' === typeof x;
    }

    function isSet(x) {
        return 'undefined' !== typeof x;
    }

    function isString(x) {
        return 'string' === typeof x;
    }

    function refGet() {
        return win.location.href;
    }

    function toCaseLower(x) {
        return x.toLowerCase();
    }

    function toCaseUpper(x) {
        return x.toUpperCase();
    }

    (function($$) {

        $$.version = '0.0.0';

        $$[instances] = {};

    })(win[name] = function(o) {

        var $ = this,
            $$ = win[name],
            hooks = {},
            home = '//' + win.location.hostname,
            ref = refGet(),
            requests = {},
            sources = {},
            state = {
                'sources': 'a[href],form[action]',
                'is': function(element) {
                    var target = element.target,
                        to = attributeGet(element, 'href') || attributeGet(element, 'action');
                    if (target && target !== '_self') {
                        return false;
                    }
                    return "" === to || -1 !== ['.', '/', '?'].indexOf(to[0]) || 0 === to.search(home) || 0 === to.search(win.location.protocol + home);
                },
                'lot': {
                    'X-Requested-With': name
                }
            };

        // Return new instance if `F3H` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(o);
        }

        // Store current instance to `F3H.instances`
        $$[instances][Object.keys($$[instances]).length] = $;

        function sourcesGet(query, root) {
            return Array.from((root || doc).querySelectorAll(query)).filter(state.is || function() {
                return false;
            });
        }

        state = Object.assign(state, o);
        sources = sourcesGet(state.sources);

        function doFetch(node, type, ref) {
            hookFire('exit', [doc, node]);
            var headers = state.lot,
                header, data,
                parts = ref.split('#'),
                xhr = new XMLHttpRequest;
            xhr.responseType = state.type || 'document';
            xhr.open(type, ref);
            if (headers && headers.length) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
            xhr.onload = function() {
                data = [xhr.response, node];
                hookFire($.status = xhr.status, data);
                hookFire('success', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
                if (parts[1]) {
                    var target = doc.getElementById(parts[1]);
                    if (target) {
                        doc.documentElement.scrollLeft = doc.body.scrollLeft = target.offsetLeft;
                        doc.documentElement.scrollTop = doc.body.scrollTop = target.offsetTop;
                    }
                }
            };
            xhr.onerror = function() {
                data = [xhr.response, node];
                hookFire('error', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
            }
            xhr.send('POST' === type ? new FormData(node) : null);
            return xhr;
        }

        function doFetchAbort(id) {
            if (requests[id]) {
                requests[id][0].abort();
                hookFire('abort', [doc, requests[id][1]]);
                delete requests[id];
            }
        }

        function doFetchAbortAll() {
            if (!requests.length) {
                return;
            }
            for (var request in requests) {
                doFetchAbort(request);
            }
        }

        function doRefChange(el, ref) {
            win.history.pushState({
                ref: ref
            }, doc.title, ref);
        }

        function hookLet(name, fn) {
            if (!isSet(name)) {
                return (hooks = {}), $;
            }
            if (isSet(hooks[name])) {
                if (isSet(fn)) {
                    for (var i = 0, j = hooks[name].length; i < j; ++i) {
                        if (fn === hooks[name][i]) {
                            hooks[name].splice(i, 1);
                        }
                    }
                } else {
                    delete hooks[name];
                }
            }
            return $;
        }

        function hookSet(name, fn) {
            if (!isSet(hooks[name])) {
                hooks[name] = [];
            }
            if (isSet(fn)) {
                hooks[name].push(fn);
            }
            return $;
        }

        function hookFire(name, lot) {
            if (!isSet(hooks[name])) {
                return $;
            }
            for (var i = 0, j = hooks[name].length; i < j; ++i) {
                hooks[name][i].apply($, lot);
            }
            return $;
        }

        function onFetch(e) {
            doFetchAbortAll();
            var t = this,
                href = t.href,
                action = t.action,
                ref = href || action,
                type = toCaseUpper(t.method || 'GET');
            if ('GET' === type && 'popstate' !== e.type) {
                doRefChange(t, href);
            }
            requests[ref] = [doFetch(t, type, ref), t];
            doPreventDefault(e);
        }

        function onPopState(e) {
            doFetchAbortAll();
            var href = e.state ? e.state.ref : ref;
            if (href) {
                requests[href] = [doFetch(win, 'GET', href), win];
            }
        }

        function onSourcesEventsSet() {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventSet(sources[i], 'FORM' === toCaseUpper(sources[i].nodeName) ? 'submit' : 'click', onFetch);
            }
        }

        $.abort = function(id) {
            if (!id) {
                doFetchAbortAll();
            } else if (requests[id]) {
                doFetchAbort(id);
            }
            return $;
        };

        $.pop = function() {
            return eventLet(win, 'popstate', onPopState), hookFire('pop', [doc, win]), $;
        };

        $.fire = hookFire;
        $.hooks = hooks;
        $.off = hookLet;
        $.on = hookSet;
        $.sources = sources;
        $.status = null;

        eventSet(win, 'DOMContentLoaded', onSourcesEventsSet);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
