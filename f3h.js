/*!
 * ==============================================================
 *  F3H 1.0.0-dev
 * ==============================================================
 * Author: Taufik Nurrohman <https://github.com/taufik-nurrohman>
 * License: MIT
 * --------------------------------------------------------------
 */

(function(win, doc, name) {

    var GET = 'GET',
        POST = 'POST',

        html = doc.documentElement,
        instances = 'instances';

    function attributeGet(node, attr) {
        return node.getAttribute(attr);
    }

    function eventNameGet(node) {
        return isNodeForm(node) ? 'submit' : 'click';
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

    function isNodeForm(x) {
        return 'form' === toCaseLower(x.nodeName);
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

    function toResponseHeadersAsObject(xhr) {
        var out = {},
            headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/),
            header, h, k, v;
        for (header in headers) {
            h = headers[header].split(': ');
            k = h.shift().replace(/(^|-)(\w)/g, function(m0, m1, m2) {
                return m1 + toCaseUpper(m2);
            });
            v = h.join(': ');
            out[k] = /^-?(\d+?\.)?\d+$/.test(v) ? +v : v;
        }
        return out;
    }

    (function($$) {

        $$.version = '1.0.0-dev';

        $$[instances] = {};

        $$._ = $$.prototype;

    })(win[name] = function(o) {

        // Prevent window from jumping to the top whenever user tries to hit the back or forward button
        win.history.scrollRestoration = 'manual';

        var $ = this,
            $$ = win[name],
            hooks = {},
            home = '//' + win.location.hostname,
            ref = refGet(),
            requests = {},
            sources = {},
            state = {
                'sources': 'a[href],form[action]',
                'is': function(source) {
                    var target = source.target,
                        to = attributeGet(source, 'href') || attributeGet(source, 'action');
                    if (target && '_self' !== target) {
                        return false;
                    }
                    return "" === to || -1 !== ['.', '/', '?'].indexOf(to[0]) || 0 === to.search(home) || 0 === to.search(win.location.protocol + home) || -1 === to.search('://');
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

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetch(node, type, ref) {
            hookFire('exit', [doc, node]);
            var body = doc.body,
                headers = state.lot,
                header, data,
                parts = ref.split('#'),
                xhr = new XMLHttpRequest,
                xhrUpload = xhr.upload, fn;
            function setData() {
                var lot = toResponseHeadersAsObject(xhr),
                    defaultType = 'document';
                // Automatic response type based on MIME type
                xhr.responseType = toCaseLower(({
                    'application/atom+xml': defaultType,
                    'application/json': 'json',
                    'application/mathml+xml': defaultType,
                    'application/octet-stream': 'blob',
                    'application/rss+xml': defaultType,
                    'application/xhtml+xml': defaultType,
                    'application/xml': defaultType,
                    'application/xslt+xml': defaultType,
                    'image/svg+xml': defaultType,
                    'svg': defaultType,
                    'text/html': defaultType,
                    'text/xml': defaultType
                })[lot['Content-Type']] || 'text');
                $.lot = lot;
                $.status = xhr.status;
            }
            xhr.open(type, ref, true);
            if (headers && headers.length) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
            eventSet(xhr, 'abort', function() {
                hookFire('abort', [xhr.response, node]);
            });
            eventSet(xhr, 'error', fn = function() {
                data = [xhr.response, node];
                hookFire('error', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
            });
            eventSet(xhrUpload, 'error', fn);
            eventSet(xhr, 'load', fn = function() {
                data = [xhr.response, node];
                hookFire($.status, data), hookFire('success', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
                // Jump to the hash position
                if (parts[1]) {
                    var target = doc.getElementById(parts[1]) || doc.getElementsByName(parts[1])[0];
                    if (target) {
                        html.scrollLeft = body.scrollLeft = target.offsetLeft;
                        html.scrollTop = body.scrollTop = target.offsetTop;
                    }
                }
            });
            eventSet(xhrUpload, 'load', fn);
            eventSet(xhr, 'progress', function(e) {
                hookFire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            eventSet(xhrUpload, 'progress', function(e) {
                hookFire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            eventSet(xhr, 'readystatechange', function() {
                /* xhr.HEADERS_RECEIVED */ 2 === xhr.readyState && setData();
            });
            // eventSet(xhr, 'timeout', fn = function() {});
            // eventSet(xhrUpload, 'timeout', fn);
            xhr.send(POST === type ? new FormData(node) : null);
            hookFire('enter', [doc, node]);
            return xhr;
        }

        function doFetchAbort(id) {
            if (requests[id]) {
                requests[id][0].abort();
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
            }, "", ref);
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
                type = toCaseUpper(t.method || GET);
            if (GET === type && 'popstate' !== e.type) {
                doRefChange(t, href);
            }
            requests[ref] = [doFetch(t, type, ref), t];
            doPreventDefault(e);
        }

        function onPopState(e) {
            doFetchAbortAll();
            var href = e.state ? e.state.ref : ref;
            if (href) {
                requests[href] = [doFetch(win, GET, href), win];
            }
        }

        function onSourcesEventsLet() {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventLet(sources[i], eventNameGet(sources[i]), onFetch);
            }
        }

        function onSourcesEventsSet() {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventSet(sources[i], eventNameGet(sources[i]), onFetch);
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
            onSourcesEventsLet();
            return eventLet(win, 'popstate', onPopState), hookFire('pop', [doc, win]), $.abort();
        };

        $.fire = hookFire;
        $.hooks = hooks;
        $.lot = {};
        $.off = hookLet;
        $.on = hookSet;
        $.sources = sources;
        $.state = state;
        $.status = null;

        eventSet(win, 'DOMContentLoaded', onSourcesEventsSet);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
