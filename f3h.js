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

        querySelector = 'querySelector',
        querySelectorAll = querySelector + 'All',

        responseTypeHTML = 'document',
        responseTypeJSON = 'json',
        responseTypeTXT = 'text',

        html = doc.documentElement,
        home = '//' + win.location.hostname,
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

        $$.state = {
            'sources': 'a[href],form[action]',
            'is': function(source) {
                var target = source.target,
                    src = 'search',
                    to = attributeGet(source, 'href') || attributeGet(source, 'action');
                if (target && '_self' !== target) {
                    return false;
                }
                if (0 === to[src](/(data|javascript|mailto):/)) {
                    return false;
                }
                return "" === to ||
                    0 === to[src](/[.\/?]/) ||
                    0 === to[src](home) ||
                    0 === to[src](win.location.protocol + home) ||
                    0 !== to[src]('://');
            },
            'lot': {
                'X-Requested-With': name
            },
            'types': {
                "": responseTypeHTML, // Default response type for extension-less URL
                'ASP': responseTypeHTML,
                'HTM': responseTypeHTML,
                'HTML': responseTypeHTML,
                'JSON': responseTypeJSON,
                'PHP': responseTypeHTML,
                'XML': responseTypeHTML
            }
        };

        $$[instances] = {};

        $$._ = $$.prototype;

    })(win[name] = function(o) {

        // Drop feature(s) in legacy JavaScript environment
        if (!(win.history && win.history.pushState)) {
            return;
        }

        // Prevent window from jumping to the top whenever user tries to hit the back or forward button
        win.history.scrollRestoration = 'manual';

        var $ = this,
            $$ = win[name],
            hooks = {},
            ref = refGet(),
            requests = {},
            state = Object.assign({}, $$.state, (o || {})),
            sources = sourcesGet(state.sources);

        // Return new instance if `F3H` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(o);
        }

        // Store current instance to `F3H.instances`
        $$[instances][Object.keys($$[instances]).length] = $;

        function sourcesGet(query, root) {
            return Array.from((root || doc)[querySelectorAll](query)).filter(state.is || function() {
                return true;
            });
        }

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetch(node, type, ref) {
            $.ref = ref;
            hookFire('exit', [doc, node]);
            var headers = state.lot,
                header, data, response,
                xhr = new XMLHttpRequest,
                xhrUpload = xhr.upload, fn;
            // Automatic response type by file extension
            var responseType = state.types[toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || "")] || responseTypeTXT;
            if (isFunction(responseType)) {
                responseType = responseType.call($, ref);
            }
            xhr.responseType = responseType;
            xhr.open(type, ref, true);
            if (POST === type) {
                headers['Content-Type'] = 'multipart/form-data';
            }
            if (headers && headers.length) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
            function setData() {
                $.lot = toResponseHeadersAsObject(xhr);
                $.status = xhr.status;
            }
            eventSet(xhr, 'abort', function() {
                setData(), hookFire('abort', [xhr.response, node]);
            });
            eventSet(xhr, 'error', fn = function() {
                data = [response = xhr.response, node];
                setData(), hookFire('error', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
                doFocusToElement();
                doScrollToElement();
            });
            eventSet(xhrUpload, 'error', fn);
            eventSet(xhr, 'load', fn = function() {
                data = [response = xhr.response, node];
                setData(), hookFire($.status, data), hookFire('success', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
                doFocusToElement();
                doScrollToElement();
            });
            eventSet(xhrUpload, 'load', fn);
            eventSet(xhr, 'progress', function(e) {
                setData(), hookFire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            eventSet(xhrUpload, 'progress', function(e) {
                setData(), hookFire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
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

        // Focus to the first form element that has `autofocus` attribute
        function doFocusToElement() {
            var target = doc[querySelector]('[autofocus]');
            target && target.focus();
        }

        function doRefChange(el, ref) {
            win.history.pushState({
                ref: ref
            }, "", ref);
        }

        // Scroll to the first element with `id` or `name` attribute that has value as the location hash value
        function doScrollToElement() {
            var hash = win.location.hash.replace('#', "");
            if (hash) {
                var body = doc.body,
                    target = doc.getElementById(hash) || doc.getElementsByName(hash)[0];
                if (target) {
                    html.scrollLeft = body.scrollLeft = target.offsetLeft;
                    html.scrollTop = body.scrollTop = target.offsetTop;
                }
            }
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
        $.ref = null;
        $.sources = sources;
        $.state = state;
        $.status = null;

        eventSet(win, 'DOMContentLoaded', onSourcesEventsSet);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
