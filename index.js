/*!
 *
 * The MIT License (MIT)
 *
 * Copyright © 2020 Taufik Nurrohman
 *
 * <https://github.com/taufik-nurrohman/f3h>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.F3H = factory());
}(this, (function () { 'use strict';

    const isArray = x => Array.isArray(x);
    const isBoolean = x => false === x || true === x;
    const isDefined = x => 'undefined' !== typeof x;
    const isFunction = x => 'function' === typeof x;
    const isInstance = (x, of) => x && isSet(of) && x instanceof of;
    const isNull = x => null === x;
    const isNumeric = x => /^-?(?:\d*.)?\d+$/.test(x + "");
    const isObject = (x, isPlain = true) => {
        if ('object' !== typeof x) {
            return false;
        }
        return isPlain ? isInstance(x, Object) : true;
    };
    const isSet = x => isDefined(x) && !isNull(x);
    const isString = x => 'string' === typeof x;

    const fromValue = x => {
        if (isArray(x)) {
            return x.map(v => fromValue(x));
        }
        if (isObject(x)) {
            for (let k in x) {
                x[k] = fromValue(x[k]);
            }
            return x;
        }
        if (false === x) {
            return 'false';
        }
        if (null === x) {
            return 'null';
        }
        if (true === x) {
            return 'true';
        }
        return "" + x;
    };

    const toCaseLower = x => x.toLowerCase();
    const toCaseUpper = x => x.toUpperCase();
    const toNumber = (x, base = 10) => parseInt(x, base);
    const toValue = x => {
        if (isArray(x)) {
            return x.map(v => toValue(v));
        }
        if (isNumeric(x)) {
            return toNumber(x);
        }
        if (isObject(x)) {
            for (let k in x) {
                x[k] = toValue(x[k]);
            }
            return x;
        }
        return ({
            'false': false,
            'null': null,
            'true': true
        })[x] || x;
    };

    const D = document;
    const W = window;
    const R = D.documentElement;

    const fromElement = node => {
        let attributes = getAttributes(node),
            content = getHTML(node),
            title = getName(node);
        return false !== content ? [title, content, attributes] : [title, attributes];
    };

    const getAttribute = (node, attribute, parseValue = true) => {
        if (!hasAttribute(node, attribute)) {
            return null;
        }
        let value = node.getAttribute(attribute);
        return parseValue ? toValue(value) : value;
    };

    const getAttributes = (node, parseValue = true) => {
        let attributes = node.attributes,
            value, values = {};
        for (let i = 0, j = attributes.length; i < j; ++i) {
            value = attributes[i].value;
            values[attributes[i].name] = parseValue ? toValue(value) : value;
        }
        return values;
    };

    const getElement = (query, scope) => {
        return (scope || D).querySelector(query);
    };

    const getElements = (query, scope) => {
        return (scope || D).querySelectorAll(query);
    };

    const getHTML = (node, trim = true) => {
        let state = 'innerHTML';
        if (!hasState(node, state)) {
            return false;
        }
        let content = node[state];
        content = trim ? content.trim() : content;
        return "" !== content ? content : null;
    };

    const getName = node => {
        return ((node || {}).nodeName || "").toLowerCase() || null;
    };

    const getNext = node => {
        return node.nextElementSibling || null;
    };

    const getParent = node => {
        return node.parentNode || null;
    };

    const getText = (node, trim = true) => {
        let state = 'textContent';
        if (!hasState(node, state)) {
            return false;
        }
        let content = node[state];
        content = trim ? content.trim() : content;
        return "" !== content ? content : null;
    };

    const hasAttribute = (node, attribute) => {
        return node.hasAttribute(attribute);
    };

    const hasParent = node => {
        return null !== getParent(node);
    };

    const hasState = (node, state) => {
        return state in node;
    };

    const isWindow = node => {
        return node === W;
    };

    const letAttribute = (node, attribute) => {
        return node.removeAttribute(attribute), node;
    };

    const letElement = node => {
        let parent = getParent(node);
        return node.remove(), parent;
    };

    const setAttribute = (node, attribute, value) => {
        return node.setAttribute(attribute, fromValue(value)), node;
    };

    const setAttributes = (node, attributes) => {
        let value;
        for (let attribute in attributes) {
            value = attributes[attribute];
            if (value || "" === value || 0 === value) {
                setAttribute(node, attribute, value);
            } else {
                letAttribute(node, attribute);
            }
        }
        return node;
    };

    const setChildLast = (parent, node) => {
        return parent.append(node), node;
    };

    const setElement = (node, content, attributes) => {
        node = isString(node) ? D.createElement(node) : node;
        if (isObject(content)) {
            attributes = content;
            content = false;
        }
        if (isString(content)) {
            setHTML(node, content);
        }
        if (isObject(attributes)) {
            setAttributes(node, attributes);
        }
        return node;
    };

    const setHTML = (node, content, trim = true) => {
        let state = 'innerHTML';
        return hasState(node, state) && (node[state] = trim ? content.trim() : content), node;
    };

    const setPrev = (current, node) => {
        return getParent(current).insertBefore(node, current), node;
    };

    const toElement = fromArray => {
        return setElement(...fromArray);
    };

    const theHistory = W.history;

    const theLocation = W.location;

    const theScript = D.currentScript;

    const off = (name, node, then) => {
        node.removeEventListener(name, then);
    };

    const on = (name, node, then, options = false) => {
        node.addEventListener(name, then, options);
    };

    function fire(name, data) {
        const $ = this;
        if (!isSet(hooks[name])) {
            return $;
        }
        hooks[name].forEach(then => then.apply($, data));
        return $;
    }

    const hooks = {};

    function off$1(name, then) {
        const $ = this;
        if (!isSet(name)) {
            return (hooks = {}), $;
        }
        if (isSet(hooks[name])) {
            if (isSet(then)) {
                for (let i = 0, j = hooks[name].length; i < j; ++i) {
                    if (then === hooks[name][i]) {
                        hooks[name].splice(i, 1);
                        break;
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

    function on$1(name, then) {
        const $ = this;
        if (!isSet(hooks[name])) {
            hooks[name] = [];
        }
        if (isSet(then)) {
            hooks[name].push(then);
        }
        return $;
    }

    const isPattern = pattern => isInstance(pattern, RegExp);
    const toPattern = (pattern, opt) => {
        if (isPattern(pattern)) {
            return pattern;
        }
        // No need to escape `/` in the pattern string
        pattern = pattern.replace(/\//g, '\\/');
        return new RegExp(pattern, isSet(opt) ? opt : 'g');
    };

    var name = 'F3H',
        GET = 'GET',
        POST = 'POST',
        responseTypeHTML = 'document',
        responseTypeJSON = 'json',
        responseTypeTXT = 'text',
        home = '//' + theLocation.hostname,
        B,
        H;

    function getEventName(node) {
      return isForm(node) ? 'submit' : 'click';
    }

    function getHash(ref) {
      return ref.split('#')[1] || "";
    }

    function getLinks(scope) {
      var id,
          out = {},
          link,
          links = getElements('link[rel=dns-prefetch],link[rel=preconnect],link[rel=prefetch],link[rel=preload],link[rel=prerender]', scope),
          toSave;

      for (var i = 0, j = links.length; i < j; ++i) {
        if (isLinkForF3H(link = links[i])) {
          continue;
        }

        link.id = id = link.id || name + ':' + toID(getAttribute(link, 'href') || getText(link));
        out[id] = toSave = fromElement(link);
        out[id][toSave.length - 1].href = link.href; // Use the resolved URL!
      }

      return out;
    }

    function getRef() {
      return theLocation.href;
    }

    function getScripts(scope) {
      var id,
          out = {},
          script,
          scripts = getElements('script', scope),
          toSave;

      for (var i = 0, j = scripts.length; i < j; ++i) {
        if (isScriptForF3H(script = scripts[i])) {
          continue;
        }

        script.id = id = script.id || name + ':' + toID(getAttribute(script, 'src') || getText(script));
        out[id] = toSave = fromElement(script);
        out[id][toSave.length - 1].src = script.src; // Use the resolved URL!
      }

      return out;
    }

    function getStyles(scope) {
      var id,
          out = {},
          style,
          styles = getElements('link[rel=stylesheet],style', scope),
          toSave;

      for (var i = 0, j = styles.length; i < j; ++i) {
        if (isStyleForF3H(style = styles[i])) {
          continue;
        }

        style.id = id = style.id || name + ':' + toID(getAttribute(style, 'href') || getText(style));
        out[id] = toSave = fromElement(style);

        if ('link' === toSave[0]) {
          out[id][toSave.length - 1].href = style.href; // Use the resolved URL!
        }
      }

      return out;
    }

    function getTarget(id, orName) {
      return id ? D.getElementById(id) || (orName ? D.getElementsByName(id)[0] : null) : null;
    }

    function isForm(node) {
      return 'form' === getName(node);
    }

    function isLinkForF3H(node) {
      var n = toCaseLower(name); // Exclude `<link rel="*">` tag that contains `data-f3h` or `f3h` attribute

      if (hasAttribute(node, 'data-' + n) || hasAttribute(node, n)) {
        return 1;
      }

      return 0;
    }

    function isScriptForF3H(node) {
      // Exclude this very JavaScript
      if (node.src && theScript.src === node.src) {
        return 1;
      }

      var n = toCaseLower(name); // Exclude JavaScript tag that contains `data-f3h` or `f3h` attribute

      if (hasAttribute(node, 'data-' + n) || hasAttribute(node, n)) {
        return 1;
      } // Exclude JavaScript that contains `F3H` instantiation


      if (toPattern('\\b' + name + '\\b').test(getText(node) || "")) {
        return 1;
      }

      return 0;
    }

    function isStyleForF3H(node) {
      var n = toCaseLower(name); // Exclude CSS tag that contains `data-f3h` or `f3h` attribute

      if (hasAttribute(node, 'data-' + n) || hasAttribute(node, n)) {
        return 1;
      }

      return 0;
    }

    function letHash(ref) {
      return ref.split('#')[0];
    } // Ignore trailing `/` character(s) in URL


    function letSlashEnd(ref) {
      return ref.replace(/\/+$/, "");
    }

    function preventDefault(e) {
      e.preventDefault();
    } // <https://stackoverflow.com/a/8831937/1163000>


    function toID(text) {
      var out = 0,
          c,
          i,
          j = text.length;

      if (0 === j) {
        return out;
      }

      for (i = 0; i < j; ++i) {
        c = text.charCodeAt(i);
        out = (out << 5) - out + c;
        out = out & out; // Convert to 32bit integer
      } // Force absolute value


      return out < 1 ? out * -1 : out;
    }

    function toHeadersAsProxy(request) {
      var out = {},
          headers = request.getAllResponseHeaders().trim().split(/[\r\n]+/),
          header,
          h,
          k,
          v,
          w;

      for (header in headers) {
        h = headers[header].split(': ');
        k = toCaseLower(h.shift());
        w = toCaseLower(v = h.join(': '));
        out[k] = toValue(v);
      } // Use proxy to make case-insensitive response header’s key


      return new Proxy(out, {
        get: function get(o, k) {
          return o[toCaseLower(k)] || null;
        },
        set: function set(o, k, v) {
          o[toCaseLower(k)] = v;
        }
      });
    }

    function F3H(source, state) {
      if (source === void 0) {
        source = D;
      }

      if (state === void 0) {
        state = {};
      }

      var $ = this; // Return new instance if `F3H` was called without the `new` operator

      if (!isInstance($, F3H)) {
        return new F3H(source, state);
      }

      if (!isSet(source) || isBoolean(source) || isObject(source)) {
        state = source;
        source = D;
      }

      $.state = Object.assign({}, F3H.state, true === state ? {
        cache: state
      } : state || {});
      $.source = source;
      var sources = getSources($.state.sources);

      if ($.state.turbo) {
        $.state.cache = true; // Enable turbo feature will force enable cache feature
      } // Store current instance to `F3H.instances`


      F3H.instances[$.source.id || $.source.name || Object.keys(F3H.instances).length] = $;
      $.caches = {};
      $.hooks = hooks;
      $.links = {};
      $.lot = {};
      $.ref = null;
      $.requests = {};
      $.scripts = {};
      $.status = null;
      $.styles = {}; // Store current node to a variable to be compared to the next node

      var nodeCurrent = null; // Get current URL to be used as the default state after the last pop state

      var ref = getRef(); // Store current URL to a variable to be compared to the next URL

      var refCurrent = ref;

      function getSources(sources, root) {
        var froms = getElements(sources, root, $.source),
            theRef = getRef();

        if (isFunction($.state.is)) {
          var to = [];
          froms.forEach(function (from) {
            $.state.is.call($, from, theRef) && to.push(from);
          });
          return to;
        }

        return froms;
      } // Include submit button value to the form data ;)


      function doAppendCurrentButtonValue(node) {
        var buttonValueStorage = setElement('input', {
          type: 'hidden'
        }),
            buttons = getElements('[name][type=submit][value]', node, $.source);
        setChildLast(node, buttonValueStorage);
        buttons.forEach(function (button) {
          on('click', button, function () {
            buttonValueStorage.name = this.name;
            buttonValueStorage.value = this.value;
          });
        });
      }

      function doChangeRef(ref) {
        if (ref === getRef()) {
          return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
        }

        $.state.history && theHistory.pushState({}, "", ref);
      }

      function doFetch(node, type, ref) {
        var nodeIsWindow = isWindow(node),
            useHistory = $.state.history,
            data; // Compare currently selected source element with the previously stored source element, unless it is a window.
        // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element

        if (GET === type && node === nodeCurrent && !nodeIsWindow) {
          return; // Accidental click(s) on the same source element should cancel the request!
        }

        nodeCurrent = node; // Store currently selected source element to a variable to be compared later

        refCurrent = $.ref = ref;
        $.fire('exit', [D, node]); // Get response from cache if any

        if ($.state.cache) {
          var cache = $.caches[letSlashEnd(letHash(ref))]; // `[status, response, lot, requestIsDocument]`

          if (cache) {
            $.lot = cache[2];
            $.status = cache[0];
            cache[3] && !nodeIsWindow && useHistory && doScrollTo(R);
            doChangeRef(ref);
            data = [cache[1], node]; // Update `<link rel="*">` data for the next page

            cache[3] && ($.links = doUpdateLinks(data[0])); // Update CSS before markup change

            cache[3] && ($.styles = doUpdateStyles(data[0]));
            $.fire('success', data);
            $.fire(cache[0], data);
            sources = getSources($.state.sources); // Update JavaScript after markup change

            cache[3] && ($.scripts = doUpdateScripts(data[0]));
            onSourcesEventsSet(data);
            $.fire('enter', data);
            return;
          }
        }

        var fn,
            lot,
            redirect,
            status,
            request = doFetchBase(node, type, ref, $.state.lot),
            requestAsPush = request.upload,
            requestIsDocument = responseTypeHTML === request.responseType;

        function dataSet() {
          // Store response from GET request(s) to cache
          lot = toHeadersAsProxy(request);
          status = request.status;

          if (GET === type && $.state.cache) {
            // Make sure `status` is not `0` due to the request abortion, to prevent `null` response being cached
            status && ($.caches[letSlashEnd(letHash(ref))] = [status, request.response, lot, requestIsDocument]);
          }

          $.lot = lot;
          $.status = status;
        }

        on('abort', request, function () {
          dataSet(), $.fire('abort', [request.response, node]);
        });
        on('error', request, fn = function fn() {
          dataSet();
          requestIsDocument && !nodeIsWindow && useHistory && doScrollTo(R);
          data = [request.response, node]; // Update `<link rel="*">` data for the next page

          requestIsDocument && ($.links = doUpdateLinks(data[0])); // Update CSS before markup change

          requestIsDocument && ($.styles = doUpdateStyles(data[0]));
          $.fire('error', data);
          sources = getSources($.state.sources); // Update JavaScript after markup change

          requestIsDocument && ($.scripts = doUpdateScripts(data[0]));
          onSourcesEventsSet(data);
          $.fire('enter', data);
        });
        on('error', requestAsPush, fn);
        on('load', request, fn = function fn() {
          dataSet();
          data = [request.response, node];
          redirect = request.responseURL; // Handle internal server-side redirection
          // <https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx>

          if (status >= 300 && status < 400) {
            // Redirection should delete a cache related to the response URL
            // This is useful for case(s) like, when you have submitted a
            // comment form and then you will be redirected to the same URL
            var r = letSlashEnd(redirect);
            $.caches[r] && delete $.caches[r]; // Trigger hook(s) immediately

            $.fire('success', data);
            $.fire(status, data); // Do the normal fetch

            doFetch(nodeCurrent = W, GET, redirect || ref);
            return;
          } // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
          // if (GET === type) {


          doChangeRef(-1 === ref.indexOf('#') ? redirect || ref : ref); // }
          // Update CSS before markup change

          requestIsDocument && ($.styles = doUpdateStyles(data[0]));
          $.fire('success', data);
          $.fire(status, data);
          requestIsDocument && useHistory && doScrollTo(R);
          sources = getSources($.state.sources); // Update JavaScript after markup change

          requestIsDocument && ($.scripts = doUpdateScripts(data[0]));
          onSourcesEventsSet(data);
          $.fire('enter', data);
        });
        on('load', requestAsPush, fn);
        on('progress', request, function (e) {
          dataSet(), $.fire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
        });
        on('progress', requestAsPush, function (e) {
          dataSet(), $.fire('push', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
        });
        return request;
      }

      function doFetchAbort(id) {
        if ($.requests[id] && $.requests[id][0]) {
          $.requests[id][0].abort();
          delete $.requests[id];
        }
      }

      function doFetchAbortAll() {
        for (var request in $.requests) {
          doFetchAbort(request);
        }
      } // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!


      function doFetchBase(node, type, ref, headers) {
        ref = isFunction($.state.ref) ? $.state.ref.call($, node, ref) : ref;
        var header,
            request = new XMLHttpRequest(); // Automatic response type based on current file extension

        var x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
            responseType = $.state.types[x] || $.state.type || responseTypeTXT;

        if (isFunction(responseType)) {
          responseType = responseType.call($, ref);
        }

        request.responseType = responseType;
        request.open(type, ref, true); // if (POST === type) {
        //    request.setRequestHeader('content-type', node.enctype || 'multipart/form-data');
        // }

        if (isObject(headers)) {
          for (header in headers) {
            request.setRequestHeader(header, headers[header]);
          }
        }

        request.send(POST === type ? new FormData(node) : null);
        return request;
      } // Focus to the first element that has `autofocus` attribute


      function doFocusToElement(data) {
        if ($.hooks.focus) {
          $.fire('focus', data);
          return;
        }

        var target = getElement('[autofocus]', $.source);
        target && target.focus();
      } // Pre-fetch page and store it into cache


      function doPreFetch(node, ref) {
        var request = doFetchBase(node, GET, ref),
            status;
        on('load', request, function () {
          if (200 === (status = request.status)) {
            $.caches[letSlashEnd(letHash(ref))] = [status, request.response, toHeadersAsProxy(request), responseTypeHTML === request.responseType];
          }
        });
      }

      function doPreFetchElement(node) {
        on('mousemove', node, onHoverOnce);
      }

      function doScrollTo(node) {
        if (!node) {
          return;
        }

        R.scrollLeft = B.scrollLeft = node.offsetLeft;
        R.scrollTop = B.scrollTop = node.offsetTop;
      } // Scroll to the first element with `id` or `name` attribute that has the same value as location hash


      function doScrollToElement(data) {
        if ($.hooks.scroll) {
          $.fire('scroll', data);
          return;
        }

        doScrollTo(getTarget(getHash(getRef()), 1));
      }

      function doUpdate(compare, to, getAll, defaultContainer) {
        var id,
            toCompare = getAll(compare),
            node,
            placesToRestore = {},
            v;

        for (id in to) {
          if (node = getElement('#' + id.replace(/[:.]/g, '\\$&'), $.source)) {
            placesToRestore[id] = getNext(node);
          }

          if (!toCompare[id]) {
            delete to[id];
            letElement(getTarget(id));
          }
        }

        for (id in toCompare) {
          if (!to[id]) {
            to[id] = v = toCompare[id];

            if (placesToRestore[id] && hasParent(placesToRestore[id])) {
              setPrev(placesToRestore[id], toElement(v));
            } else if (defaultContainer) {
              setChildLast(defaultContainer, toElement(v));
            }
          }
        }

        return to;
      }

      function doUpdateLinks(compare) {
        return doUpdate(compare, $.links, getLinks, H);
      }

      function doUpdateScripts(compare) {
        return doUpdate(compare, $.scripts, getScripts, B);
      }

      function doUpdateStyles(compare) {
        return doUpdate(compare, $.styles, getStyles, H);
      }

      function onDocumentReady() {
        // Detect key down/up event
        on('keydown', D, onKeyDown);
        on('keyup', D, onKeyUp); // Set body and head variable value once, on document ready

        B = D.body;
        H = D.head; // Make sure all element(s) are captured on document ready

        $.links = getLinks();
        $.scripts = getScripts();
        $.styles = getStyles();
        onSourcesEventsSet([D, W]); // Store the initial page into cache

        $.state.cache && doPreFetch(W, getRef());
      }

      function onFetch(e) {
        doFetchAbortAll(); // Use native web feature when user press the control key

        if (keyIsCtrl) {
          return;
        }

        var t = this,
            q,
            href = t.href,
            action = t.action,
            theRef = href || action,
            type = toCaseUpper(t.method || GET);

        if (GET === type) {
          if (isForm(t)) {
            q = new URLSearchParams(new FormData(t)) + "";
            theRef = letSlashEnd(theRef.split(/[?&#]/)[0]) + (q ? '?' + q : "");
          } // Immediately change the URL if turbo feature is enabled


          if ($.state.turbo) {
            doChangeRef(theRef);
          }
        }

        $.requests[theRef] = [doFetch(t, type, theRef), t];
        preventDefault(e);
      }

      function onHashChange(e) {
        doScrollTo(getTarget(getHash(getRef()), 1));
        preventDefault(e);
      } // Pre-fetch URL on link hover


      function onHoverOnce() {
        var t = this,
            href = t.href;

        if (!$.caches[letSlashEnd(letHash(href))]) {
          doPreFetch(t, href);
        }

        off('mousemove', t, onHoverOnce);
      } // Check if user is pressing the control key before clicking on a link


      var keyIsCtrl = false;

      function onKeyDown(e) {
        keyIsCtrl = e.ctrlKey;
      }

      function onKeyUp() {
        keyIsCtrl = false;
      }

      function onPopState(e) {
        doFetchAbortAll();
        var theRef = getRef(); // Updating the hash value shouldn’t trigger the AJAX call!

        if (getHash(theRef) && letHash(refCurrent) === letHash(theRef)) {
          return;
        }

        $.requests[theRef] = [doFetch(W, GET, theRef), W];
      }

      function onSourcesEventsLet() {
        sources.forEach(function (source) {
          on(getEventName(source), source, onFetch);
        });
      }

      function onSourcesEventsSet(data) {
        var turbo = $.state.turbo;
        sources.forEach(function (source) {
          on(getEventName(source), source, onFetch);

          if (isForm(source)) {
            doAppendCurrentButtonValue(source);
          } else {
            turbo && doPreFetchElement(source);
          }
        });
        doFocusToElement(data);
        doScrollToElement(data);
      }

      $.abort = function (request) {
        if (!request) {
          doFetchAbortAll();
        } else if ($.requests[request]) {
          doFetchAbort(request);
        }

        return $;
      };

      $.fetch = function (ref, type, from) {
        return doFetchBase(from, type, ref);
      };

      $.fire = fire.bind($);
      $.off = off$1.bind($);
      $.on = on$1.bind($);

      $.pop = function () {
        onSourcesEventsLet();
        off('DOMContentLoaded', W, onDocumentReady);
        off('hashchange', W, onHashChange);
        off('keydown', D, onKeyDown);
        off('keyup', D, onKeyUp);
        off('popstate', W, onPopState);
        $.fire('pop', [D, W]);
        return $.abort();
      };

      on('DOMContentLoaded', W, onDocumentReady);
      on('hashchange', W, onHashChange);
      on('popstate', W, onPopState);
      return $;
    }

    F3H.instances = {};
    F3H.state = {
      'cache': false,
      // Store all response body to variable to be used later?
      'history': true,
      'is': function is(source, theRef) {
        var target = source.target,
            // Get URL data as-is from the DOM attribute string
        raw = getAttribute(source, 'href') || getAttribute(source, 'action') || "",
            // Get resolved URL data from the DOM property
        value = source.href || source.action || "";

        if (target && '_self' !== target) {
          return false;
        } // Exclude URL contains hash only, and any URL prefixed by `data:`, `javascript:` and `mailto:`


        if ('#' === raw[0] || /^(data|javascript|mailto):/.test(raw)) {
          return false;
        } // If `value` is the same as current URL excluding the hash, treat `raw` as hash only,
        // so that we don’t break the native hash change event that you may want to add in the future


        if (getHash(value) && letHash(theRef) === letHash(value)) {
          return false;
        } // Detect internal link starts from here


        return "" === raw || 0 === raw.search(/[.\/?]/) || 0 === raw.indexOf(home) || 0 === raw.indexOf(theLocation.protocol + home) || -1 === raw.indexOf('://');
      },
      'lot': {
        'x-requested-with': name
      },
      'ref': function ref(source, theRef) {
        return theRef;
      },
      // Default URL hook
      'sources': 'a[href],form',
      'turbo': false,
      // Pre-fetch any URL on hover?
      'type': responseTypeHTML,
      'types': {
        "": responseTypeHTML,
        // Default response type for extension-less URL
        'CSS': responseTypeTXT,
        'JS': responseTypeTXT,
        'JSON': responseTypeJSON
      }
    };
    F3H.version = '1.1.4';

    return F3H;

})));
