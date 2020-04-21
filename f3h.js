/*!
 * ==============================================================
 *  F3H 1.0.2
 * ==============================================================
 * Author: Taufik Nurrohman <https://github.com/taufik-nurrohman>
 * License: MIT
 * --------------------------------------------------------------
 */

(function(win, doc, name) {

    var GET = 'GET',
        POST = 'POST',

        responseTypeHTML = 'document',
        responseTypeJSON = 'json',
        responseTypeTXT = 'text',

        search = 'search',
        test = 'test',

        history = win.history,
        location = win.location,
        home = '//' + location.hostname,
        html = doc.documentElement, body,
        instances = 'instances';

    function attributeGet(node, attr) {
        return node.getAttribute(attr);
    }

    function doPreventDefault(e) {
        e.preventDefault();
    }

    function eventNameGet(node) {
        return isNodeForm(node) ? 'submit' : 'click';
    }

    function eventLet(node, name, fn) {
        node.removeEventListener(name, fn);
    }

    function eventSet(node, name, fn) {
        node.addEventListener(name, fn, false);
    }

    function hashGet(ref) {
        return ref.split('#')[1] || "";
    }

    function hashLet(ref) {
        return ref.split('#')[0];
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

    function query(selector, base) {
        return (base || doc).querySelector(selector);
    }

    function queryAll(selector, base) {
        return (base || doc).querySelectorAll(selector);
    }

    function refGet() {
        return location.href;
    }

    function targetGet(id) {
        return id ? (doc.getElementById(id) || doc.getElementsByName(id)[0]) : "";
    }

    function toCaseLower(x) {
        return x.toLowerCase();
    }

    function toCaseUpper(x) {
        return x.toUpperCase();
    }

    function toHeadersAsProxy(xhr) {
        var out = {},
            headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/),
            header, h, k, v, w;
        for (header in headers) {
            h = headers[header].split(': ');
            k = toCaseLower(h.shift());
            w = toCaseLower(v = h.join(': '));
            // Evaluate string value into their appropriate data type
            if ("" === w || 'null' === w) {
                v = null;
            } else if ('true' === w) {
                v = true;
            } else if ('false' === w) {
                v = false;
            } else if (/^-?(\d*\.)?\d+$/[test](v)) {
                v = +v;
            }
            out[k] = v;
        }
        // Use proxy to make response header’s key to be case-insensitive
        return new Proxy(out, {
            get: function(o, k) {
                return o[toCaseLower(k)] || null;
            },
            set: function(o, k, v) {
                o[toCaseLower(k)] = v;
            }
        });
    }

    (function($$) {

        $$.version = '1.0.2';

        $$.state = {
            'cache': false, // Store all response body to variable to be used later?
            'history': true,
            'is': function(source, refNow) {
                var target = source.target,
                    // Get URL data as-is from the DOM attribute string
                    raw = attributeGet(source, 'href') || attributeGet(source, 'action') || "",
                    // Get resolved URL data from the DOM property
                    value = source.href || source.action || "";
                if (target && '_self' !== target) {
                    return false;
                }
                // Exclude URL contains hash only, and any URL prefixed by `data:`, `javascript:` and `mailto:`
                if ('#' === raw[0] || /^(data|javascript|mailto):/[test](raw)) {
                    return false;
                }
                // If `value` is the same as current URL excluding the hash, treat `raw` as hash only,
                // so that we don’t break the native hash change event that you may want to add in the future
                if (hashGet(value) && hashLet(refNow) === hashLet(value)) {
                    return false;
                }
                // Detect internal link starts from here
                return "" === raw ||
                    0 === raw[search](/[.\/?]/) ||
                    0 === raw[search](home) ||
                    0 === raw[search](location.protocol + home) ||
                    0 !== raw[search]('://');
            },
            'lot': {
                'x-requested-with': name
            },
            'ref': function(source, refNow) {
                return refNow; // Default URL hook
            },
            'sources': 'a[href],form',
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
            caches = {},
            hooks = {},
            ref = refGet(), // Get current URL to be used as the default state after the last pop state
            refCurrent = ref, // Store current URL to a variable to be compared to the next URL
            requests = {},
            state = Object.assign({}, $$.state, true === o ? {
                cache: o
            } : (o || {})),
            sources = sourcesGet(state.sources), nodeCurrent;

        // Return new instance if `F3H` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(o);
        }

        // Store current instance to `F3H.instances`
        $$[instances][Object.keys($$[instances]).length] = $;

        function sourcesGet(sources, root) {
            var from = queryAll(sources, root),
                refNow = refGet();
            if (isFunction(state.is)) {
                var to = [];
                for (var i = 0, j = from.length; i < j; ++i) {
                    state.is.call($, from[i], refNow) && to.push(from[i]);
                }
                return to;
            }
            return from;
        }

        function doFetch(node, type, ref) {
            // Compare currently selected source element with the previously stored source element, unless it is a window.
            // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element
            if (GET === type && node === nodeCurrent && node !== win) {
                return; // Accidental click(s) on the same source element should cancel the request!
            }
            nodeCurrent = node; // Store currently selected source element to a variable to be compared later
            refCurrent = $.ref = ref;
            hookFire('exit', [doc, node]);
            // Get response from cache if any
            if (state.cache) {
                var cache = caches[hashLet(ref)]; // `[status, response, lot]`
                if (cache) {
                    $.lot = cache[2];
                    $.status = cache[0];
                    doRefChange(node, ref);
                    data = [cache[1], node];
                    hookFire('success', data);
                    hookFire(cache[0], data);
                    sources = sourcesGet(state.sources);
                    onSourcesEventsSet(data);
                    hookFire('enter', data);
                    return;
                }
            }
            var headers = state.lot || {},
                data, fn, header, redirect,
                xhr = doFetchBase(node, type, isFunction(state.ref) ? state.ref.call($, node, ref) : ref),
                xhrUpload = xhr.upload;
            if (headers && headers.length) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
            function dataSet() {
                // Store response from GET request(s) to cache
                var lot = toHeadersAsProxy(xhr),
                    status = xhr.status;
                if (GET === type && state.cache) {
                    caches[hashLet(ref)] = [status, xhr.response, lot];
                }
                $.lot = lot;
                $.status = status;
            }
            eventSet(xhr, 'abort', function() {
                dataSet(), hookFire('abort', [xhr.response, node]);
            });
            eventSet(xhr, 'error', fn = function() {
                dataSet();
                data = [xhr.response, node];
                hookFire('error', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet(data);
                hookFire('enter', data);
            });
            eventSet(xhrUpload, 'error', fn);
            eventSet(xhr, 'load', fn = function() {
                // Handle internal server-side redirection
                redirect = xhr.responseURL;
                // `redirect !== hashLet(ref)` because URL hash is not included in `xhr.responseURL` object
                // <https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseURL>
                if (redirect && redirect !== hashLet(ref)) {
                    nodeCurrent = win;
                    // Redirection should delete cache related to response URL
                    // This is useful for case(s) like, when you have submitted
                    // a comment form and then you will be redirected to the same URL
                    caches[redirect] && (delete caches[redirect]);
                    // Do the normal fetch
                    doFetch(node, GET, redirect);
                    return;
                }
                dataSet();
                // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
                if (GET === type) {
                    doRefChange(node, ref);
                }
                data = [xhr.response, node];
                hookFire('success', data);
                hookFire($.status, data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet(data);
                hookFire('enter', data);
            });
            eventSet(xhrUpload, 'load', fn);
            eventSet(xhr, 'progress', function(e) {
                dataSet(), hookFire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            eventSet(xhrUpload, 'progress', function(e) {
                dataSet(), hookFire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
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

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetchBase(node, type, ref) {
            var xhr = new XMLHttpRequest;
            // Automatic response type based on current file extension
            var x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
                responseType = state.types[x] || responseTypeTXT;
            if (isFunction(responseType)) {
                responseType = responseType.call($, ref);
            }
            xhr.responseType = responseType;
            xhr.open(type, ref, true);
            if (POST === type) {
                xhr.setRequestHeader('content-type', node.enctype || 'multipart/form-data');
            }
            xhr.send(POST === type ? new FormData(node) : null);
            return xhr;
        }

        // Focus to the first element that has `autofocus` attribute
        function doFocusToElement(data) {
            if (hooks.focus) {
                hookFire('focus', data);
                return;
            }
            var target = query('[autofocus]');
            target && target.focus();
        }

        // Prefetch page and store it into cache
        function doPreFetch(node, ref) {
            var xhr = doFetchBase(node, GET, ref), status;
            eventSet(xhr, 'load', function() {
                if (status = xhr.status) {
                    caches[hashLet(ref)] = [status, xhr.response, toHeadersAsProxy(xhr)];
                }
            });
        }

        function doRefChange(el, ref) {
            if (ref === refGet()) {
                return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
            }
            state.history && history.pushState({}, "", ref);
        }

        function doScrollTo(node) {
            html.scrollLeft = body.scrollLeft = node.offsetLeft;
            html.scrollTop = body.scrollTop = node.offsetTop;
        }

        // Scroll to the first element with `id` or `name` attribute that has the same value as location hash
        function doScrollToElement(data) {
            if (hooks.scroll) {
                hookFire('scroll', data);
                return;
            }
            doScrollTo(targetGet(hashGet(refGet())) || html);
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

        function onDocumentReady() {
            body = doc.body; // Set body variable value once, on document ready
            onSourcesEventsSet([doc, win]);
            // Store the initial page into cache
            state.cache && doPreFetch(win, refGet());
        }

        function onFetch(e) {
            doFetchAbortAll();
            var t = this,
                href = t.href,
                action = t.action,
                refNow = href || action,
                type = toCaseUpper(t.method || GET);
            if (GET === type) {
                doRefChange(t, refNow);
            }
            requests[refNow] = [doFetch(t, type, refNow), t];
            doPreventDefault(e);
        }

        function onHashChange(e) {
            doScrollTo(targetGet(hashGet(refGet())) || html);
            doPreventDefault(e);
        }

        function onPopState(e) {
            doFetchAbortAll();
            var refNow = refGet();
            // Updating the hash value shouldn’t trigger the AJAX call!
            if (hashGet(refNow) && hashLet(refCurrent) === hashLet(refNow)) {
                return;
            }
            requests[refNow] = [doFetch(win, GET, refNow), win];
        }

        function onSourcesEventsLet() {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventLet(sources[i], eventNameGet(sources[i]), onFetch);
            }
        }

        function onSourcesEventsSet(data) {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventSet(sources[i], eventNameGet(sources[i]), onFetch);
            }
            doFocusToElement(data);
            doScrollToElement(data);
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
            eventLet(win, 'DOMContentLoaded', onDocumentReady);
            eventLet(win, 'hashchange', onHashChange);
            eventLet(win, 'popstate', onPopState);
            hookFire('pop', [doc, win]);
            return $.abort();
        };

        $.caches = caches;
        $.fetch = function(ref, type, node) {
            return doFetchBase(node, type, ref);
        };
        $.fire = hookFire;
        $.hooks = hooks;
        $.lot = {};
        $.off = hookLet;
        $.on = hookSet;
        $.ref = null;
        $.state = state;
        $.status = null;

        eventSet(win, 'DOMContentLoaded', onDocumentReady);

        eventSet(win, 'hashchange', onHashChange);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
