/*!
 * ==============================================================
 *  F3H 1.0.1
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
        location = win.location,
        home = '//' + location.hostname,
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

    function refGet() {
        return location.href;
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
        return out;
    }

    (function($$) {

        $$.version = '1.0.1';

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

        function sourcesGet(query, root) {
            var from = (root || doc)[querySelectorAll](query),
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

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetch(node, type, ref) {
            // Compare currently selected source element with the previously stored source element, unless it is a window.
            // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element
            if (node === nodeCurrent && node !== win) {
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
                    doRefChange(node, ref, $.status = cache[0]);
                    data = [cache[1], node];
                    hookFire(cache[0], data);
                    hookFire('success', data);
                    sources = sourcesGet(state.sources);
                    onSourcesEventsSet(data);
                    hookFire('enter', data);
                    return;
                }
            }
            var headers = state.lot || {},
                xhr = new XMLHttpRequest,
                xhrUpload = xhr.upload,
                data, fn, header, redirect;
            // Automatic response type based on current file extension
            var x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
                responseType = state.types[x] || responseTypeTXT;
            if (isFunction(responseType)) {
                responseType = responseType.call($, ref);
            }
            xhr.responseType = responseType;
            xhr.open(type, isFunction(state.ref) ? state.ref.call($, node, ref) : ref, true);
            if (POST === type) {
                headers['content-type'] = node.enctype || 'multipart/form-data';
            }
            if (headers && headers.length) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
            }
            function dataSet() {
                // Use proxy to make response header’s key to be case-insensitive
                var lot = new Proxy(toResponseHeadersAsObject(xhr), {
                        get: function(o, k) {
                            return o[toCaseLower(k)] || null;
                        },
                        set: function(o, k, v) {
                            o[toCaseLower(k)] = v;
                        }
                    }),
                    status = xhr.status;
                $.lot = lot;
                $.status = status;
                // Store response from GET request(s) to cache
                if (GET === type && state.cache) {
                    caches[hashLet(ref)] = [status, xhr.response, lot];
                }
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
                    // Redirection should delete cache related to response URL
                    // This is useful for case(s) like, when you have submitted
                    // a comment form and then you will be redirected to the same URL
                    caches[redirect] && (delete caches[redirect]);
                    // Do the normal fetch
                    doFetch(node, GET, redirect);
                    return;
                }
                dataSet();
                if (GET === type) {
                    doRefChange(node, ref, $.status);
                }
                data = [xhr.response, node];
                hookFire($.status, data);
                hookFire('success', data);
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
            // eventSet(xhr, 'timeout', fn = function() {});
            // eventSet(xhrUpload, 'timeout', fn);
            xhr.send(POST === type ? new FormData(node) : null);
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
        function doFocusToElement(data) {
            if (hooks.focus) {
                hookFire('focus', data);
                return;
            }
            var target = doc[querySelector]('[autofocus]');
            target && target.focus();
        }

        function doRefChange(el, ref, status) {
            if (ref === refGet()) {
                return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
            }
            state.history && 200 === status && history.pushState({}, "", ref);
        }

        // Scroll to the first element with `id` or `name` attribute that has the same value as location hash
        function doScrollToElement(data) {
            if (hooks.scroll) {
                hookFire('scroll', data);
                return;
            }
            var hash = location.hash.replace('#', "");
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
                refNow = href || action,
                type = toCaseUpper(t.method || GET);
            requests[refNow] = [doFetch(t, type, refNow), t];
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
            return eventLet(win, 'popstate', onPopState), hookFire('pop', [doc, win]), $.abort();
        };

        $.caches = caches;
        $.fire = hookFire;
        $.hooks = hooks;
        $.lot = {};
        $.off = hookLet;
        $.on = hookSet;
        $.ref = null;
        $.sources = sources;
        $.state = state;
        $.status = null;

        eventSet(win, 'DOMContentLoaded', function() {
            onSourcesEventsSet([doc, win]);
        });

        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
