(function(win, doc, name) {

    var instances = 'instances';

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

    function sourcesGet(query, source) {
        return (source || doc).querySelectorAll(query);
    }

    function valueGet(node, prop) {
        return prop in node ? node[prop] : node.getAttribute(prop);
    }

    (function($$) {

        $$.version = '0.0.0';

        $$[instances] = {};

    })(win[name] = function(o) {

        var $ = this,
            $$ = win[name],
            firstHref = win.location.href,
            hooks = {},
            requests = {},
            sources = {},
            state = {
                'sources': 'a',
                'fetch': 'href',
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

        if (isFunction(o) || isString(o)) {
            state.fetch = o; // Do nothing!
        }

        state = Object.assign(state, o);
        sources = sourcesGet(state.sources);

        function doAbortAllFetch() {
            if (!requests.length) {
                return;
            }
            for (var request in requests) {
                requests[request][0].abort();
                hookFire('abort', [doc, requests[request][1]]);
                delete requests[request];
            }
        }

        function doFetch(el, method, to) {
            hookFire('exit', [doc, el]);
            var type = state.type,
                lot = state.lot,
                xhr = new XMLHttpRequest;
            xhr.responseType = type || 'document';
            xhr.open(method.toUpperCase(), to);
            if (lot && lot.length) {
                for (var k in lot) {
                    xhr.setRequestHeader(k, lot[k]);
                }
            }
            xhr.onload = function() {
                var data = [xhr.response, el];
                hookFire('success', data);
                hookFire(xhr.status, data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
            };
            xhr.onerror = function() {
                var data = [xhr.response, el];
                hookFire('error', data);
                sources = sourcesGet(state.sources);
                onSourcesEventsSet();
            }
            xhr.send(); // TODO: Post request(s)
            return xhr;
        }

        function doLocationChange(el, href) {
            win.history.pushState({
                href: href
            }, doc.title, href);
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

        function onClick(e) {
            doAbortAllFetch();
            var t = this,
                to = state.fetch,
                href = valueGet(t, isFunction(to) ? to.call($, t) : to), method;
            requests[href] = [doFetch(t, method = (valueGet(t, 'method') || 'get').toLowerCase(), href), t];
            if ('get' === method) {
                doLocationChange(t, href);
            }
            doPreventDefault(e);
        }

        function onPopState(e) {
            doAbortAllFetch();
            var href = e.state ? e.state.href : firstHref;
            if (href) {
                requests[href] = [doFetch(win, 'get', href), win];
            }
            console.log([e,this])
        }

        function onSourcesEventsSet() {
            for (var i = 0, j = sources.length; i < j; ++i) {
                eventSet(sources[i], 'click', onClick);
            }
        }

        $.abort = function(href) {
            if (!href) {
                doAbortAllFetch();
            } else if (requests[href]) {
                requests[href][0].abort();
                hookFire('abort', [doc, requests[href][1]]);
            }
            return $;
        };

        $.pop = function() {
            eventLet(win, 'popstate', onPopState);
        }

        $.fire = hookFire;
        $.hooks = hooks;
        $.off = hookLet;
        $.on = hookSet;
        $.sources = sources;

        eventSet(win, 'DOMContentLoaded', onSourcesEventsSet);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(this, this.document, 'F3H');
