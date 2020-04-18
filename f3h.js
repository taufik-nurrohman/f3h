/*!
 * ==============================================================
 *  F3H 1.0.0
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

        search = 'search',
        test = 'test',

        history = win.history,
        home = '//' + win.location.hostname,
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
            out[k] = /^-?((\d+)?\.)?\d+$/[test](v) ? +v : v;
        }
        return out;
    }

    (function($$) {

        $$.version = '1.0.0';

        $$.state = {
            'focus': true, // Focus to the first element that has `autofocus` attribute?
            'is': function(source, refCurrent) {
                var target = source.target,
                    // Get URL data as-is from the DOM attribute string
                    raw = attributeGet(source, 'href') || attributeGet(source, 'action'),
                    // Get resolved URL data from the DOM property
                    value = source.href || source.action;
                if (target && '_self' !== target) {
                    return false;
                }
                // Exclude URL contains hash only, and any URL prefixed by `data:`, `javascript:` and `mailto:`
                if ('#' === raw[0] || /^(data|javascript|mailto):/[test](raw)) {
                    return false;
                }
                // If `value` is the same as current URL excluding the hash, treat `raw` as hash only,
                // so that we don’t break the native hash change event that you may want to add in the future
                if (-1 !== value[search]('#') && refCurrent.split('#')[0] === value.split('#')[0]) {
                    return false;
                }
                // Detect internal link starts from here
                return "" === raw ||
                    0 === raw[search](/[.\/?]/) ||
                    0 === raw[search](home) ||
                    0 === raw[search](win.location.protocol + home) ||
                    0 !== raw[search]('://');
            },
            'lot': {
                'X-Requested-With': name
            },
            'ref': function(source, refCurrent) {
                return refCurrent; // Default URL hook
            },
            'scroll': true, // Scroll to the first element with `id` or `name` attribute that has the same value as location hash?
            'sources': 'a[href],form[action]',
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
        if (!(history && history.pushState)) {
            return;
        }

        // Prevent window from jumping to the top whenever user tries to hit the back or forward button
        history.scrollRestoration = 'manual';

        var $ = this,
            $$ = win[name],
            hooks = {},
            ref = refGet(), // Get current URL to be used as the default state after the last pop state
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
            var from = (root || doc)[querySelectorAll](query),
                refCurrent = refGet();
            if (isFunction(state.is)) {
                var to = [];
                for (var i = 0, j = from.length; i < j; ++i) {
                    state.is.call($, from[i], refCurrent) && to.push(from[i]);
                }
                return to;
            }
            return from;
        }

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetch(node, type, ref) {
            $.ref = ref;
            hookFire('exit', [doc, node]);
            var headers = state.lot || {},
                xhr = new XMLHttpRequest,
                xhrUpload = xhr.upload,
                data, fn, header, response;
            // Automatic response type by file extension
            var x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
                responseType = state.types[x] || responseTypeTXT;
            if (isFunction(responseType)) {
                responseType = responseType.call($, ref);
            }
            xhr.responseType = responseType;
            xhr.open(type, isFunction(state.ref) ? state.ref.call($, node, ref) : ref, true);
            if (POST === type) {
                headers['Content-Type'] = node.enctype || 'multipart/form-data';
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
            });
            eventSet(xhrUpload, 'error', fn);
            eventSet(xhr, 'load', fn = function() {
                setData();
                if (GET === type) {
                    doRefChange(node, ref, $.status);
                }
                data = [response = xhr.response, node];
                hookFire($.status, data), hookFire('success', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
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

        // Focus to the first element that has `autofocus` attribute
        function doFocusToElement() {
            if (!state.focus) {
                return;
            }
            var target = doc[querySelector]('[autofocus]');
            target && target.focus();
        }

        function doRefChange(el, ref, status) {
            if (ref === refGet()) {
                return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
            }
            200 === status && history.pushState({
                ref: ref
            }, "", ref);
        }

        // Scroll to the first element with `id` or `name` attribute that has the same value as location hash
        function doScrollToElement() {
            if (!state.scroll) {
                return;
            }
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
            requests[ref] = [doFetch(t, type, ref), t];
            doPreventDefault(e);
        }

        function onPopState(e) {
            doFetchAbortAll();
            var href = e.state && e.state.ref;
            if (href) {
                requests[href] = [doFetch(win, GET, href), win];
            } else {
                // TODO
                // requests[ref] = [doFetch(win, GET, ref), win];
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
            doFocusToElement();
            doScrollToElement();
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
