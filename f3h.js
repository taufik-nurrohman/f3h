/*!
 * ==============================================================
 *  F3H 1.0.18
 * ==============================================================
 * Author: Taufik Nurrohman <https://github.com/taufik-nurrohman>
 * License: MIT
 * --------------------------------------------------------------
 */

((win, doc, name) => {

    let GET = 'GET',
        POST = 'POST',

        responseTypeHTML = 'document',
        responseTypeJSON = 'json',
        responseTypeTXT = 'text',

        indexOf = 'indexOf',
        replace = 'replace',
        search = 'search',
        test = 'test',

        history = win.history,
        location = win.location,
        home = '//' + location.hostname,
        html = doc.documentElement,
        head, body,
        instances = 'instances',

        scriptCurrent = doc.currentScript;

    function attributeGet(node, attr) {
        return node.getAttribute(attr);
    }

    function attributeHas(node, attr) {
        return node.hasAttribute(attr);
    }

    function attributeSet(node, attr, value) {
        return node.setAttribute(attr, value);
    }

    function contentGet(node) {
        return node.innerHTML;
    }

    // Convert appropriate data type value into their string format
    function eval0(v) {
        if (false === v) {
            return 'false';
        }
        if (null === v) {
            return 'null';
        }
        if (true === v) {
            return 'true';
        }
        return v + "";
    }

    // Evaluate string value into their appropriate data type
    function eval1(v) {
        if ('false' === v) {
            return false;
        }
        if ("" === v || 'null' === v) {
            return null;
        }
        if ('true' === v) {
            return true;
        }
        if (/^-?(\d*\.)?\d+$/[test](v)) {
            return +v;
        }
        return v;
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

    // <https://stackoverflow.com/a/8831937/1163000>
    function idFrom(text) {
        let out = 0, c, i, j = text.length;
        if (0 === j) {
            return out;
        }
        for (i = 0; i < j; ++i) {
            c = text.charCodeAt(i);
            out = ((out << 5) - out) + c;
            out = out & out; // Convert to 32bit integer
        }
        // Force absolute value
        return out < 1 ? out * -1 : out;
    }

    function isFunction(x) {
        return 'function' === typeof x;
    }

    function isLinkForF3H(node) {
        let n = toCaseLower(name);
        // Exclude `<link rel="*">` tag that contains `data-f3h` or `f3h` attribute
        if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
            return 1;
        }
        return 0;
    }

    function isNodeForm(x) {
        return 'form' === toCaseLower(x.nodeName);
    }

    function isObject(x) {
        return 'object' === typeof x;
    }

    function isSet(x) {
        return 'undefined' !== typeof x && null !== x;
    }

    function isScriptForF3H(node) {
        // Exclude this very JavaScript
        if (node.src && scriptCurrent.src === node.src) {
            return 1;
        }
        let n = toCaseLower(name);
        // Exclude JavaScript tag that contains `data-f3h` or `f3h` attribute
        if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
            return 1;
        }
        // Exclude JavaScript that contains `F3H` instantiation
        if ((new RegExp('\\b' + name + '\\b')).test(contentGet(node) || "")) {
            return 1;
        }
        return 0;
    }

    function isString(x) {
        return 'string' === typeof x;
    }

    function isStyleForF3H(node) {
        let n = toCaseLower(name);
        // Exclude CSS tag that contains `data-f3h` or `f3h` attribute
        if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
            return 1;
        }
        return 0;
    }

    function linkGetAll(base) {
        let id, out = {}, link,
            links = nodeGetAll('link[rel=dns-prefetch],link[rel=preconnect],link[rel=prefetch],link[rel=preload],link[rel=prerender]', base);
        for (let i = 0, j = links.length; i < j; ++i) {
            if (isLinkForF3H(link = links[i])) {
                continue;
            }
            link.id = (id = link.id || name + ':' + idFrom(attributeGet(link, 'href') || contentGet(link)));
            out[id] = nodeSave(link);
            out[id][2].href = link.href; // Use the resolved URL!
        }
        return out;
    }

    function nodeGet(selector, base) {
        return (base || doc).querySelector(selector);
    }

    function nodeGetAll(selector, base) {
        return (base || doc).querySelectorAll(selector);
    }

    function nodeInsert(node, before, base) {
        base.insertBefore(node, before && base === before.parentNode ? before : null);
    }

    function nodeLet(node) {
        if (!node) {
            return;
        }
        let parent = node.parentNode;
        parent && parent.removeChild(node);
    }

    function nodeRestore(from) {
        let node = doc.createElement(from[0]);
        node.innerHTML = from[1];
        for (let k in from[2]) {
            attributeSet(node, k, eval0(from[2][k]));
        }
        return node;
    }

    function nodeSave(node) {
        let attr = node.attributes,
            // `[name, content, attributes]`
            to = [toCaseLower(node.nodeName), contentGet(node), {}];
        for (let i = 0, j = attr.length; i < j; ++i) {
            to[2][attr[i].name] = eval1(attr[i].value);
        }
        return to;
    }

    // Ignore trailing `/` character(s) in URL
    function slashEndLet(ref) {
        return ref[replace](/\/+$/, "");
    }

    function preventDefault(e) {
        e.preventDefault();
    }

    function refGet() {
        return location.href;
    }

    function scriptGetAll(base) {
        let id, out = {}, script,
            scripts = nodeGetAll('script', base);
        for (let i = 0, j = scripts.length; i < j; ++i) {
            if (isScriptForF3H(script = scripts[i])) {
                continue;
            }
            script.id = (id = script.id || name + ':' + idFrom(attributeGet(script, 'src') || contentGet(script)));
            out[id] = nodeSave(script);
        }
        return out;
    }

    function styleGetAll(base) {
        let id, out = {}, style,
            styles = nodeGetAll('link[rel=stylesheet],style', base);
        for (let i = 0, j = styles.length; i < j; ++i) {
            if (isStyleForF3H(style = styles[i])) {
                continue;
            }
            style.id = (id = style.id || name + ':' + idFrom(attributeGet(style, 'href') || contentGet(style)));
            out[id] = nodeSave(style);
        }
        return out;
    }

    function targetGet(id, orName) {
        return id ? (doc.getElementById(id) || (orName ? doc.getElementsByName(id)[0] : null)) : null;
    }

    function toCaseLower(x) {
        return x.toLowerCase();
    }

    function toCaseUpper(x) {
        return x.toUpperCase();
    }

    function toHeadersAsProxy(xhr) {
        let out = {},
            headers = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/),
            header, h, k, v, w;
        for (header in headers) {
            h = headers[header].split(': ');
            k = toCaseLower(h.shift());
            w = toCaseLower(v = h.join(': '));
            out[k] = eval1(v);
        }
        // Use proxy to make response header’s key to be case-insensitive
        return new Proxy(out, {
            get: (o, k) => {
                return o[toCaseLower(k)] || null;
            },
            set: (o, k, v) => {
                o[toCaseLower(k)] = v;
            }
        });
    }

    ($$ => {

        $$[instances] = {};

        $$.state = {
            'cache': false, // Store all response body to variable to be used later?
            'history': true,
            'is': (source, refNow) => {
                let target = source.target,
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
                    0 === raw[indexOf](home) ||
                    0 === raw[indexOf](location.protocol + home) ||
                   -1 === raw[indexOf]('://');
            },
            'lot': {
                'x-requested-with': name
            },
            'ref': (source, refNow) => refNow, // Default URL hook
            'sources': 'a[href],form',
            'turbo': false, // Pre-fetch any URL on hover?
            'type': responseTypeHTML,
            'types': {
                "": responseTypeHTML, // Default response type for extension-less URL
                'CSS': responseTypeTXT,
                'JS': responseTypeTXT,
                'JSON': responseTypeJSON
            }
        };

        $$.version = '1.0.18';

    })(win[name] = function(o) {

        let $ = this,
            $$ = win[name],
            caches = {},
            hooks = {},
            ref = refGet(), // Get current URL to be used as the default state after the last pop state
            refCurrent = ref, // Store current URL to a variable to be compared to the next URL

            requests = {},

            links,
            scripts,
            styles,

            state = Object.assign({}, $$.state, true === o ? {
                cache: o
            } : (o || {})),
            sources = sourcesGet(state.sources),

            nodeCurrent;

        if (state.turbo) {
            state.cache = true; // Enable turbo feature will force enable cache feature
        }

        // Return new instance if `F3H` was called without the `new` operator
        if (!($ instanceof $$)) {
            return new $$(o);
        }

        // Store current instance to `F3H.instances`
        $$[instances][Object.keys($$[instances]).length] = $;

        function sourcesGet(sources, root) {
            let from = nodeGetAll(sources, root),
                refNow = refGet();
            if (isFunction(state.is)) {
                let to = [];
                for (let i = 0, j = from.length; i < j; ++i) {
                    state.is.call($, from[i], refNow) && to.push(from[i]);
                }
                return to;
            }
            return from;
        }

        // Include submit button value to the form data ;)
        function doAppendCurrentButtonValue(node) {
            let buttonValueStorage = doc.createElement('input'),
                buttons = nodeGetAll('[name][type=submit][value]', node);
            buttonValueStorage.type = 'hidden';
            nodeInsert(buttonValueStorage, 0, node);
            for (let i = 0, j = buttons.length; i < j; ++i) {
                eventSet(buttons[i], 'click', function() {
                    buttonValueStorage.name = this.name;
                    buttonValueStorage.value = this.value;
                });
            }
        }

        function doFetch(node, type, ref) {
            let isWindow = node === win,
                useHistory = state.history, data;
            // Compare currently selected source element with the previously stored source element, unless it is a window.
            // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element
            if (GET === type && node === nodeCurrent && !isWindow) {
                return; // Accidental click(s) on the same source element should cancel the request!
            }
            nodeCurrent = node; // Store currently selected source element to a variable to be compared later
            refCurrent = $.ref = ref;
            hookFire('exit', [doc, node]);
            // Get response from cache if any
            if (state.cache) {
                let cache = caches[slashEndLet(hashLet(ref))]; // `[status, response, lot, xhrIsDocument]`
                if (cache) {
                    $.lot = cache[2];
                    $.status = cache[0];
                    cache[3] && !isWindow && useHistory && doScrollTo(html);
                    doRefChange(ref);
                    data = [cache[1], node];
                    // Update `<link rel="*">` data for the next page
                    cache[3] && (links = doUpdateLinks(data[0]));
                    // Update CSS before markup change
                    cache[3] && (styles = doUpdateStyles(data[0]));
                    hookFire('success', data);
                    hookFire(cache[0], data);
                    sources = sourcesGet(state.sources);
                    // Update JavaScript after markup change
                    cache[3] && (scripts = doUpdateScripts(data[0]));
                    onSourcesEventsSet(data);
                    hookFire('enter', data);
                    return;
                }
            }
            let fn, lot, redirect, status,
                xhr = doFetchBase(node, type, ref, state.lot),
                xhrIsDocument = responseTypeHTML === xhr.responseType,
                xhrPush = xhr.upload;
            function dataSet() {
                // Store response from GET request(s) to cache
                lot = toHeadersAsProxy(xhr);
                status = xhr.status;
                if (GET === type && state.cache) {
                    // Make sure `status` is not `0` due to the request abortion, to prevent `null` response being cached
                    status &&
                    (caches[slashEndLet(hashLet(ref))] = [status, xhr.response, lot, xhrIsDocument]);
                }
                $.lot = lot;
                $.status = status;
            }
            eventSet(xhr, 'abort', () => {
                dataSet(), hookFire('abort', [xhr.response, node]);
            });
            eventSet(xhr, 'error', fn = () => {
                dataSet();
                xhrIsDocument && !isWindow && useHistory && doScrollTo(html);
                data = [xhr.response, node];
                // Update `<link rel="*">` data for the next page
                xhrIsDocument && (links = doUpdateLinks(data[0]));
                // Update CSS before markup change
                xhrIsDocument && (styles = doUpdateStyles(data[0]));
                hookFire('error', data);
                sources = sourcesGet(state.sources);
                // Update JavaScript after markup change
                xhrIsDocument && (scripts = doUpdateScripts(data[0]));
                onSourcesEventsSet(data);
                hookFire('enter', data);
            });
            eventSet(xhrPush, 'error', fn);
            eventSet(xhr, 'load', fn = () => {
                dataSet();
                data = [xhr.response, node];
                redirect = xhr.responseURL;
                // Handle internal server-side redirection
                // <https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx>
                if (status >= 300 && status < 400) {
                    // Redirection should delete a cache related to the response URL
                    // This is useful for case(s) like, when you have submitted a
                    // comment form and then you will be redirected to the same URL
                    let r = slashEndLet(redirect);
                    caches[r] && (delete caches[r]);
                    // Trigger hook(s) immediately
                    hookFire('success', data);
                    hookFire(status, data);
                    // Do the normal fetch
                    doFetch(nodeCurrent = win, GET, redirect || ref);
                    return;
                }
                // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
                // if (GET === type) {
                    doRefChange(-1 === ref[indexOf]('#') ? (redirect || ref) : ref);
                // }
                // Update CSS before markup change
                xhrIsDocument && (styles = doUpdateStyles(data[0]));
                hookFire('success', data);
                hookFire(status, data);
                xhrIsDocument && useHistory && doScrollTo(html);
                sources = sourcesGet(state.sources);
                // Update JavaScript after markup change
                xhrIsDocument && (scripts = doUpdateScripts(data[0]));
                onSourcesEventsSet(data);
                hookFire('enter', data);
            });
            eventSet(xhrPush, 'load', fn);
            eventSet(xhr, 'progress', e => {
                dataSet(), hookFire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            eventSet(xhrPush, 'progress', e => {
                dataSet(), hookFire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
            });
            return xhr;
        }

        function doFetchAbort(id) {
            if (requests[id] && requests[id][0]) {
                requests[id][0].abort();
                delete requests[id];
            }
        }

        function doFetchAbortAll() {
            for (let request in requests) {
                doFetchAbort(request);
            }
        }

        // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!
        function doFetchBase(node, type, ref, headers) {
            ref = isFunction(state.ref) ? state.ref.call($, node, ref) : ref;
            let header, xhr = new XMLHttpRequest;
            // Automatic response type based on current file extension
            let x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
                responseType = state.types[x] || state.type || responseTypeTXT;
            if (isFunction(responseType)) {
                responseType = responseType.call($, ref);
            }
            xhr.responseType = responseType;
            xhr.open(type, ref, true);
            // if (POST === type) {
            //    xhr.setRequestHeader('content-type', node.enctype || 'multipart/form-data');
            // }
            if (isObject(headers)) {
                for (header in headers) {
                    xhr.setRequestHeader(header, headers[header]);
                }
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
            let target = nodeGet('[autofocus]');
            target && target.focus();
        }

        // Pre-fetch page and store it into cache
        function doPreFetch(node, ref) {
            let xhr = doFetchBase(node, GET, ref), status;
            eventSet(xhr, 'load', () => {
                if (200 === (status = xhr.status)) {
                    caches[slashEndLet(hashLet(ref))] = [status, xhr.response, toHeadersAsProxy(xhr), responseTypeHTML === xhr.responseType];
                }
            });
        }

        function doPreFetchElement(node) {
            eventSet(node, 'mousemove', onHoverOnce);
        }

        function doRefChange(ref) {
            if (ref === refGet()) {
                return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
            }
            state.history && history.pushState({}, "", ref);
        }

        function doScrollTo(node) {
            if (!node) {
                return;
            }
            html.scrollLeft = body.scrollLeft = node.offsetLeft;
            html.scrollTop = body.scrollTop = node.offsetTop;
        }

        // Scroll to the first element with `id` or `name` attribute that has the same value as location hash
        function doScrollToElement(data) {
            if (hooks.scroll) {
                hookFire('scroll', data);
                return;
            }
            doScrollTo(targetGet(hashGet(refGet()), 1));
        }

        function doUpdate(compare, to, getAll, defaultContainer) {
            let id, toCompare = getAll(compare),
                node, placesToRestore = {}, v;
            for (id in to) {
                if (node = nodeGet('#' + id[replace](/[:.]/g, '\\$&'))) {
                    placesToRestore[id] = node.nextElementSibling;
                }
                if (!toCompare[id]) {
                    delete to[id];
                    nodeLet(targetGet(id));
                }
            }
            for (id in toCompare) {
                if (!to[id]) {
                    to[id] = (v = toCompare[id]);
                    nodeInsert(nodeRestore(v), placesToRestore[id], defaultContainer);
                }
            }
            return to;
        }

        function doUpdateLinks(compare) {
            return doUpdate(compare, links, linkGetAll, head);
        }

        function doUpdateScripts(compare) {
            return doUpdate(compare, scripts, scriptGetAll, body);
        }

        function doUpdateStyles(compare) {
            return doUpdate(compare, styles, styleGetAll, head);
        }

        function hookLet(name, fn) {
            if (!isSet(name)) {
                return (hooks = {}), $;
            }
            if (isSet(hooks[name])) {
                if (isSet(fn)) {
                    for (let i = 0, j = hooks[name].length; i < j; ++i) {
                        if (fn === hooks[name][i]) {
                            hooks[name].splice(i, 1);
                        }
                    }
                    // Clean-up empty hook(s)
                    if (0 === j) {
                        delete hooks[name];
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
            for (let i = 0, j = hooks[name].length; i < j; ++i) {
                hooks[name][i].apply($, lot);
            }
            return $;
        }

        function onDocumentReady() {
            // Detect key down/up event
            eventSet(doc, 'keydown', onKeyDown);
            eventSet(doc, 'keyup', onKeyUp);
            // Set body and head variable value once, on document ready
            body = doc.body;
            head = doc.head;
            // Make sure all element(s) are captured on document ready
            $.links = links = linkGetAll();
            $.scripts = scripts = scriptGetAll();
            $.styles = styles = styleGetAll();
            onSourcesEventsSet([doc, win]);
            // Store the initial page into cache
            state.cache && doPreFetch(win, refGet());
        }

        function onFetch(e) {
            doFetchAbortAll();
            // Use native web feature when user press the control key
            if (keyIsCtrl) {
                return;
            }
            let t = this, q,
                href = t.href,
                action = t.action,
                refNow = href || action,
                type = toCaseUpper(t.method || GET);
            if (GET === type) {
                if (isNodeForm(t)) {
                    q = (new URLSearchParams(new FormData(t))) + "";
                    refNow = slashEndLet(refNow.split(/[?&#]/)[0]) + (q ? '?' + q : "");
                }
                // Immediately change the URL if turbo feature is enabled
                if (state.turbo) {
                    doRefChange(refNow);
                }
            }
            requests[refNow] = [doFetch(t, type, refNow), t];
            preventDefault(e);
        }

        function onHashChange(e) {
            doScrollTo(targetGet(hashGet(refGet()), 1));
            preventDefault(e);
        }

        // Pre-fetch URL on link hover
        function onHoverOnce() {
            let t = this,
                href = t.href;
            if (!caches[slashEndLet(hashLet(href))]) {
                doPreFetch(t, href);
            }
            eventLet(t, 'mousemove', onHoverOnce);
        }

        // Check if user is pressing the control key before clicking on a link
        let keyIsCtrl = false;

        function onKeyDown(e) {
            keyIsCtrl = e.ctrlKey;
        }

        function onKeyUp() {
            keyIsCtrl = false;
        }

        function onPopState(e) {
            doFetchAbortAll();
            let refNow = refGet();
            // Updating the hash value shouldn’t trigger the AJAX call!
            if (hashGet(refNow) && hashLet(refCurrent) === hashLet(refNow)) {
                return;
            }
            requests[refNow] = [doFetch(win, GET, refNow), win];
        }

        function onSourcesEventsLet() {
            for (let i = 0, j = sources.length; i < j; ++i) {
                eventLet(sources[i], eventNameGet(sources[i]), onFetch);
            }
        }

        function onSourcesEventsSet(data) {
            let turbo = state.turbo;
            for (let i = 0, j = sources.length; i < j; ++i) {
                eventSet(sources[i], eventNameGet(sources[i]), onFetch);
                if (isNodeForm(sources[i])) {
                    doAppendCurrentButtonValue(sources[i]);
                } else {
                    turbo && doPreFetchElement(sources[i]);
                }
            }
            doFocusToElement(data);
            doScrollToElement(data);
        }

        $.abort = id => {
            if (!id) {
                doFetchAbortAll();
            } else if (requests[id]) {
                doFetchAbort(id);
            }
            return $;
        };

        $.pop = () => {
            onSourcesEventsLet();
            eventLet(win, 'DOMContentLoaded', onDocumentReady);
            eventLet(win, 'hashchange', onHashChange);
            eventLet(doc, 'keydown', onKeyDown);
            eventLet(doc, 'keyup', onKeyUp);
            eventLet(win, 'popstate', onPopState);
            hookFire('pop', [doc, win]);
            return $.abort();
        };

        $.caches = caches;
        $.fetch = (ref, type, from) => doFetchBase(from, type, ref);
        $.fire = hookFire;
        $.hooks = hooks;
        $.links = {};
        $.lot = {};
        $.off = hookLet;
        $.on = hookSet;
        $.ref = null;
        $.scripts = {};
        $.state = state;
        $.status = null;
        $.styles = {};

        eventSet(win, 'DOMContentLoaded', onDocumentReady);

        eventSet(win, 'hashchange', onHashChange);
        eventSet(win, 'popstate', onPopState);

        return $;

    });

})(window, document, 'F3H');
