import {D, R, W, fromElement, getAttribute, getElement, getElements, getName, getNext, getText, hasAttribute, hasParent, isWindow, letElement, setChildLast, setElement, setNext, setPrev, theHistory, theLocation, theScript, toElement} from '@taufik-nurrohman/document';
import {offEvent, offEventDefault, onEvent} from '@taufik-nurrohman/event';
import {fromStates, fromValue} from '@taufik-nurrohman/from';
import {hook} from '@taufik-nurrohman/hook';
import {isBoolean, isFunction, isInstance, isObject, isSet} from '@taufik-nurrohman/is';
import {toPattern} from '@taufik-nurrohman/pattern';
import {getOffset, setScroll} from '@taufik-nurrohman/rect';
import {toCaseLower, toCaseUpper, toCount, toObjectCount, toValue} from '@taufik-nurrohman/to';

let name = '%(js.name)',

    GET = 'GET',
    POST = 'POST',

    responseTypeHTML = 'document',
    responseTypeJSON = 'json',
    responseTypeTXT = 'text',

    home = '//' + theLocation.hostname,

    B, H;

function getEventName(node) {
    return isForm(node) ? 'submit' : 'click';
}

function getHash(ref) {
    return ref.split('#')[1] || "";
}

function getLinks(scope) {
    let id, out = {}, href, link,
        links = getElements('link[rel=dns-prefetch],link[rel=preconnect],link[rel=prefetch],link[rel=preload],link[rel=prerender]', scope), toSave;
    for (let i = 0, j = toCount(links); i < j; ++i) {
        if (isLinkToIgnore(link = links[i])) {
            continue;
        }
        href = getAttribute(link, 'href', false);
        link.id = (id = link.id || name + ':' + toID(href || getText(link)));
        out[id] = (toSave = fromElement(link));
        if (href) {
            out[id][toCount(toSave) - 1].href = link.href; // Use the resolved URL!
        }
    }
    return out;
}

function getRef() {
    return theLocation.href;
}

function getScripts(scope) {
    let id, out = {}, src, script,
        scripts = getElements('script', scope), toSave;
    for (let i = 0, j = toCount(scripts); i < j; ++i) {
        if (isScriptToIgnore(script = scripts[i])) {
            continue;
        }
        src = getAttribute(script, 'src', false);
        script.id = (id = script.id || name + ':' + toID(src || getText(script)));
        out[id] = (toSave = fromElement(script));
        if (src) {
            out[id][toCount(toSave) - 1].src = script.src; // Use the resolved URL!
        }
    }
    return out;
}

function getStyles(scope) {
    let id, out = {}, href, style,
        styles = getElements('link[rel=stylesheet],style', scope), toSave;
    for (let i = 0, j = toCount(styles); i < j; ++i) {
        if (isStyleToIgnore(style = styles[i])) {
            continue;
        }
        href = getAttribute(style, 'href', false);
        style.id = (id = style.id || name + ':' + toID(href || getText(style)));
        out[id] = (toSave = fromElement(style));
        if (href) {
            out[id][toCount(toSave) - 1].href = style.href; // Use the resolved URL!
        }
    }
    return out;
}

function getTarget(id, orName) {
    return id ? (D.getElementById(id) || (orName ? D.getElementsByName(id)[0] : null)) : null;
}

function isForm(node) {
    return 'form' === getName(node);
}

function isLinkToIgnore(node) {
    let n = toCaseLower(name);
    // Exclude `<link rel="*">` tag that contains `data-f3h` or `f3h` attribute with falsy value
    return hasAttribute(node, 'data-' + n) && !getAttribute(node, 'data-' + n) || hasAttribute(node, n) && !getAttribute(node, n) ? 1 : 0;
}

function isScriptToIgnore(node) {
    // Exclude this very JavaScript
    if (node.src && theScript.src === node.src) {
        return 1;
    }
    let n = toCaseLower(name);
    // Exclude JavaScript tag that contains `data-f3h` or `f3h` attribute with falsy value
    if (hasAttribute(node, 'data-' + n) && !getAttribute(node, 'data-' + n) || hasAttribute(node, n) && !getAttribute(node, n)) {
        return 1;
    }
    // Exclude JavaScript that contains `F3H` instantiation
    if (toPattern('\\b' + name + '\\b').test(getText(node) || "")) {
        return 1;
    }
    return 0;
}

function isSourceToIgnore(node) {
    let n = toCaseLower(name);
    // Exclude anchor tag that contains `data-f3h` or `f3h` attribute with falsy value
    return hasAttribute(node, 'data-' + n) && !getAttribute(node, 'data-' + n) || hasAttribute(node, n) && !getAttribute(node, n) ? 1 : 0;
}

function isStyleToIgnore(node) {
    let n = toCaseLower(name);
    // Exclude CSS tag that contains `data-f3h` or `f3h` attribute with falsy value
    return hasAttribute(node, 'data-' + n) && !getAttribute(node, 'data-' + n) || hasAttribute(node, n) && !getAttribute(node, n) ? 1 : 0;
}

function letHash(ref) {
    return ref.split('#')[0];
}

// <https://stackoverflow.com/a/8831937/1163000>
function toID(text) {
    let c, i,
        j = toCount(text),
        out = 0;
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

function toHeadersAsProxy(request) {
    let out = {},
        headers = request.getAllResponseHeaders().trim().split(/[\r\n]+/),
        header, h, k;
    for (header in headers) {
        h = headers[header].split(': ');
        k = toCaseLower(h.shift());
        out[k] = toValue(h.join(': '));
    }
    // Use proxy to make case-insensitive response header’s key
    return new Proxy(out, {
        get: (o, k) => {
            return o[toCaseLower(k)] || null;
        },
        set: (o, k, v) => {
            o[toCaseLower(k)] = v;
        }
    });
}

function F3H(source = D, state = {}) {

    const $ = this;

    // Return new instance if `F3H` was called without the `new` operator
    if (!isInstance($, F3H)) {
        return new F3H(source, state);
    }

    if (!isSet(source) || isBoolean(source) || isObject(source)) {
        state = source;
        source = D;
    }

    // Already instantiated, skip!
    if (source[name]) {
        return;
    }

    $.state = state = fromStates({}, F3H.state, true === state ? {
        cache: state
    } : (state || {}));

    $.source = source;

    if (state.turbo) {
        state.cache = true; // Enable turbo feature will force enable cache feature
    }

    let caches = {},
        links = null,
        lot = null,
        // Store current node to a variable to be compared to the next node
        nodeCurrent = null,
        // Get current URL to be used as the default state after the last pop state
        ref = getRef(),
        // Store current URL to a variable to be compared to the next URL
        refCurrent = ref,
        requests = {},
        scripts = null,
        sources = getSources(state.sources),
        status = null,
        styles = null;

    let {fire, hooks} = hook($);

    // Store current instance to `F3H.instances`
    F3H.instances[source.id || source.name || toObjectCount(F3H.instances)] = $;

    // Mark current DOM as active to prevent duplicate instance
    source[name] = 1;

    function getSources(sources, root) {
        ref = getRef();
        let froms = getElements(sources, root, source),
            to = [];
        if (isFunction(state.is)) {
            froms.forEach(from => {
                state.is.call($, from, ref) && !isSourceToIgnore(from) && to.push(from);
            });
        } else {
            froms.forEach(from => {
                !isSourceToIgnore(from) && to.push(from);
            });
        }
        return to;
    }

    // Include submit button value to the form data ;)
    function doAppendCurrentButtonValue(node) {
        let buttonValueStorage = setElement('input', {
                type: 'hidden'
            }),
            buttons = getElements('[name][type=submit][value]', node, source);
        setChildLast(node, buttonValueStorage);
        buttons.forEach(button => {
            onEvent('click', button, function () {
                buttonValueStorage.name = this.name;
                buttonValueStorage.value = this.value;
            });
        });
    }

    function doChangeRef(ref) {
        if (ref === getRef()) {
            return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
        }
        state.history && theHistory.pushState({}, "", ref);
    }

    function doFetch(node, type, ref) {
        let nodeIsWindow = isWindow(node),
            useHistory = state.history, data;
        // Compare currently selected source element with the previously stored source element, unless it is a window.
        // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element
        if (GET === type && node === nodeCurrent && !nodeIsWindow) {
            return; // Accidental click(s) on the same source element should cancel the request!
        }
        nodeCurrent = node; // Store currently selected source element to a variable to be compared later
        $.ref = refCurrent = ref;
        fire('exit', [D, node]);
        // Get response from cache if any
        if (state.cache) {
            let cache = caches[letHash(ref)]; // `[status, response, lot, requestIsDocument]`
            if (cache) {
                $.lot = lot = cache[2];
                $.status = status = cache[0];
                cache[3] && !nodeIsWindow && useHistory && doScrollTo(R);
                doChangeRef(ref);
                data = [cache[1], node];
                // Update `<link rel="*">` data for the next page
                cache[3] && (links = doUpdateLinks(data[0]));
                // Update CSS before markup change
                cache[3] && (styles = doUpdateStyles(data[0]));
                fire('success', data);
                fire(cache[0], data);
                sources = getSources(state.sources);
                // Update JavaScript after markup change
                cache[3] && (scripts = doUpdateScripts(data[0]));
                onSourcesEventsSet(data);
                fire('enter', data);
                return;
            }
        }
        let fn, redirect,
            request = doFetchBase(node, type, ref, state.lot),
            requestAsPush = request.upload,
            requestIsDocument = responseTypeHTML === request.responseType;
        function dataSet() {
            // Store response from GET request(s) to cache
            lot = toHeadersAsProxy(request);
            status = request.status;
            if (GET === type && state.cache) {
                // Make sure `status` is not `0` due to the request abortion, to prevent `null` response being cached
                status &&
                (caches[letHash(ref)] = [status, request.response, lot, requestIsDocument]);
            }
            $.lot = lot;
            $.status = status;
        }
        onEvent('abort', request, () => {
            dataSet(), fire('abort', [request.response, node]);
        });
        onEvent('error', request, fn = () => {
            dataSet();
            requestIsDocument && !nodeIsWindow && useHistory && doScrollTo(R);
            data = [request.response, node];
            // Update `<link rel="*">` data for the next page
            requestIsDocument && (links = doUpdateLinks(data[0]));
            // Update CSS before markup change
            requestIsDocument && (styles = doUpdateStyles(data[0]));
            fire('error', data);
            sources = getSources(state.sources);
            // Update JavaScript after markup change
            requestIsDocument && (scripts = doUpdateScripts(data[0]));
            onSourcesEventsSet(data);
            fire('enter', data);
        });
        onEvent('error', requestAsPush, fn);
        onEvent('load', request, fn = () => {
            dataSet();
            data = [request.response, node];
            redirect = request.responseURL;
            // Handle internal server-side redirection
            // <https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx>
            if (status >= 300 && status < 400) {
                // Redirection should delete a cache related to the response URL
                // This is useful for case(s) like, when you have submitted a
                // comment form and then you will be redirected to the same URL
                let r = letHash(redirect);
                caches[r] && (delete caches[r]);
                // Trigger hook(s) immediately
                fire('success', data);
                fire(status, data);
                // Do the normal fetch
                doFetch(nodeCurrent = W, GET, redirect || ref);
                return;
            }
            // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
            // if (GET === type) {
                doChangeRef(-1 === ref.indexOf('#') ? (redirect || ref) : ref);
            // }
            // Update CSS before markup change
            requestIsDocument && (styles = doUpdateStyles(data[0]));
            fire('success', data);
            fire(status, data);
            requestIsDocument && useHistory && doScrollTo(R);
            sources = getSources(state.sources);
            // Update JavaScript after markup change
            requestIsDocument && (scripts = doUpdateScripts(data[0]));
            onSourcesEventsSet(data);
            fire('enter', data);
        });
        onEvent('load', requestAsPush, fn);
        onEvent('progress', request, e => {
            dataSet(), fire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
        });
        onEvent('progress', requestAsPush, e => {
            dataSet(), fire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
        });
        return request;
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
        let header, request = new XMLHttpRequest;
        // Automatic response type based on current file extension
        let x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
            responseType = state.types[x] || state.type || responseTypeTXT;
        if (isFunction(responseType)) {
            responseType = responseType.call($, ref);
        }
        request.responseType = responseType;
        request.open(type, ref, true);
        // if (POST === type) {
        //    request.setRequestHeader('content-type', node.enctype || 'multipart/form-data');
        // }
        if (isObject(headers)) {
            for (header in headers) {
                request.setRequestHeader(header, headers[header]);
            }
        }
        request.send(POST === type ? new FormData(node) : null);
        return request;
    }

    // Focus to the first element that has `autofocus` attribute
    function doFocusToElement(data) {
        if (hooks.focus) {
            fire('focus', data);
            return;
        }
        let target = getElement('[autofocus]', source);
        target && target.focus();
    }

    // Pre-fetch page and store it into cache
    function doPreFetch(node, ref) {
        let request = doFetchBase(node, GET, ref, {
            // <https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ#as_a_server_admin_can_i_distinguish_prefetch_requests_from_normal_requests>
            'purpose': 'prefetch',
            'x-moz': 'prefetch',
            'x-purpose': 'prefetch',
            // 'x-purpose': 'preview'
        });
        onEvent('load', request, () => {
            if (200 === (status = request.status)) {
                caches[letHash(ref)] = [status, request.response, toHeadersAsProxy(request), responseTypeHTML === request.responseType];
            }
        });
    }

    function doPreFetchElement(node) {
        onEvent('mousemove', node, onHoverOnce);
    }

    function doScrollTo(node) {
        if (!node) {
            return;
        }
        let theOffset = getOffset(node);
        setScroll(B, theOffset);
        setScroll(R, theOffset);
    }

    // Scroll to the first element with `id` or `name` attribute that has the same value as location hash
    function doScrollToElement(data) {
        if (hooks.scroll) {
            fire('scroll', data);
            return;
        }
        doScrollTo(getTarget(getHash(getRef()), 1));
    }

    function doUpdate(compare, to, getAll, defaultContainer) {
        let id, toCompare = getAll(compare),
            node, placesToRestore = {}, v;
        for (id in to) {
            if (node = getElement('#' + id.replace(/[:.]/g, '\\$&'), source)) {
                placesToRestore[id] = getNext(node, true);
            }
            if (!toCompare[id]) {
                delete to[id];
                let target = getTarget(id);
                target && letElement(target);
            }
        }
        for (id in toCompare) {
            v = toCompare[id];
            if (node = getElement('#' + id.replace(/[:.]/g, '\\$&'), source)) {
                letElement(node);
            }
            if (placesToRestore[id] && hasParent(placesToRestore[id])) {
                setPrev(placesToRestore[id], toElement(v));
            } else if (defaultContainer) {
                setChildLast(defaultContainer, toElement(v));
            }
        }
        return to;
    }

    function doUpdateLinks(compare) {
        return doUpdate(compare, links = getLinks(), getLinks, H);
    }

    function doUpdateScripts(compare) {
        return doUpdate(compare, scripts = getScripts(), getScripts, B);
    }

    function doUpdateStyles(compare) {
        return doUpdate(compare, styles = getStyles(), getStyles, H);
    }

    function onDocumentReady() {
        // Detect key down/up event
        onEvent('keydown', D, onKeyDown);
        onEvent('keyup', D, onKeyUp);
        // Set body and head variable value once, on document ready
        B = D.body;
        H = D.head;
        // Make sure all element(s) are captured on document ready
        $.links = links = getLinks();
        $.scripts = scripts = getScripts();
        $.styles = styles = getStyles();
        onSourcesEventsSet([D, W]);
        // Store the initial page into cache
        state.cache && doPreFetch(W, getRef());
    }

    function onFetch(e) {
        doFetchAbortAll();
        // Skip element(s) that already have custom event(s)
        if (e.defaultPrevented) {
            return;
        }
        // Use native web feature when user press the control key
        if (keyIsCtrl) {
            return;
        }
        let t = this, q,
            href = t.href,
            action = t.action,
            ref = href || action,
            type = toCaseUpper(t.method || GET);
        if (GET === type) {
            if (isForm(t)) {
                q = (new URLSearchParams(new FormData(t))) + "";
                ref = ref.split(/[?&#]/)[0] + (q ? '?' + q : "");
            }
            // Immediately change the URL if turbo feature is enabled
            if (state.turbo) {
                doChangeRef(ref);
            }
        }
        requests[ref] = [doFetch(t, type, ref), t];
        offEventDefault(e);
    }

    function onHashChange(e) {
        doScrollTo(getTarget(getHash(getRef()), 1));
        offEventDefault(e);
    }

    // Pre-fetch URL on link hover
    function onHoverOnce() {
        let t = this,
            href = t.href;
        if (!caches[letHash(href)]) {
            doPreFetch(t, href);
        }
        offEvent('mousemove', t, onHoverOnce);
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
        ref = getRef();
        doFetchAbortAll();
        // Updating the hash value shouldn’t trigger the AJAX call!
        if (getHash(ref) && letHash(refCurrent) === letHash(ref)) {
            return;
        }
        requests[ref] = [doFetch(W, GET, ref), W];
    }

    function onSourcesEventsLet() {
        sources.forEach(source => {
            offEvent(getEventName(source), source, onFetch);
        });
    }

    function onSourcesEventsSet(data) {
        let turbo = state.turbo;
        sources.forEach(source => {
            if (source.onclick || source.onsubmit) {
                // Skip element(s) that already have active `onclick` and/or `onsubmit` attribute
            } else {
                onEvent(getEventName(source), source, onFetch);
                if (isForm(source)) {
                    doAppendCurrentButtonValue(source);
                } else {
                    turbo && doPreFetchElement(source);
                }
            }
        });
        doFocusToElement(data);
        doScrollToElement(data);
    }

    $.abort = request => {
        if (!request) {
            doFetchAbortAll();
        } else if (requests[request]) {
            doFetchAbort(request);
        }
        return $;
    };

    $.caches = caches;
    $.fetch = (ref, type, from) => doFetchBase(from, type, ref);
    $.kick = ref => {
        let trigger = setElement('a', {
                'href': ref || getRef()
            });
        onEvent('click', trigger, onFetch, {
            once: true
        });
        trigger.click();
        letElement(trigger);
    };
    $.links = links;
    $.lot = null;
    $.ref = null;
    $.scripts = scripts;
    $.state = state;
    $.styles = styles;
    $.status = null;

    $.pop = () => {
        if (!source[name]) {
            return $; // Already ejected!
        }
        delete source[name];
        onSourcesEventsLet();
        offEvent('DOMContentLoaded', W, onDocumentReady);
        offEvent('hashchange', W, onHashChange);
        offEvent('keydown', D, onKeyDown);
        offEvent('keyup', D, onKeyUp);
        offEvent('popstate', W, onPopState);
        fire('pop', [D, W]);
        return $.abort();
    };

    onEvent('DOMContentLoaded', W, onDocumentReady);

    onEvent('hashchange', W, onHashChange);
    onEvent('popstate', W, onPopState);

    return $;

}

F3H.instances = {};

F3H.state = {
    'cache': false, // Store all response body to variable to be used later?
    'history': true,
    'is': (source, ref) => {
        let target = source.target,
            // Get URL data as-is from the DOM attribute string
            raw = getAttribute(source, 'href', false) || getAttribute(source, 'action', false) || "",
            // Get resolved URL data from the DOM property
            value = source.href || source.action || "";
        if (target && '_self' !== target) {
            return false;
        }
        // Exclude URL contains hash only, and any URL prefixed by `data:`, `javascript:` and `mailto:`
        if ('#' === raw[0] || /^(data|javascript|mailto):/.test(raw)) {
            return false;
        }
        // If `value` is the same as current URL excluding the hash, treat `raw` as hash only,
        // so that we don’t break the native hash change event that you may want to add in the future
        if (getHash(value) && letHash(ref) === letHash(value)) {
            return false;
        }
        // Detect internal link starts from here
        return "" === raw ||
            0 === raw.search(/[.\/?]/) ||
            0 === raw.indexOf(home) ||
            0 === raw.indexOf(theLocation.protocol + home) ||
           -1 === raw.indexOf('://');
    },
    'lot': {
        'x-requested-with': name
    },
    'ref': (source, ref) => ref, // Default URL hook
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

F3H.version = '%(version)';

export default F3H;