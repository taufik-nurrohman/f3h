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

var F3H = (function () {
    'use strict';

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
    const isPattern = x => isInstance(x, RegExp);
    const isSet = x => isDefined(x) && !isNull(x);
    const isWindow = x => isInstance(x, Window);

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

    const toArray = x => isArray(x) ? x : [x];
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

    const offEvent = (names, node, fn) => {
        toArray(names).forEach(name => node.removeEventListener(name, fn));
    };

    const onEvent = (names, node, fn, options = false) => {
        toArray(names).forEach(name => node.addEventListener(name, fn, options));
    };

    const hooks = {};

    function fire(event, data) {
        const $ = this;
        if (!isSet(hooks[event])) {
            return $;
        }
        hooks[event].forEach(hook => hook.apply($, data));
        return $;
    }

    function off(event, fn) {
        const $ = this;
        if (!isSet(event)) {
            return (hooks = {}), $;
        }
        if (isSet(hooks[event])) {
            if (isSet(fn)) {
                hooks[event].forEach((hook, i) => {
                    if (fn === hook) {
                        hooks[event].splice(i, 1);
                    }
                });
                // Clean-up empty hook(s)
                if (0 === hooks[event].length) {
                    delete hooks[event];
                }
            } else {
                delete hooks[event];
            }
        }
        return $;
    }

    function on(event, fn) {
        const $ = this;
        if (!isSet(hooks[event])) {
            hooks[event] = [];
        }
        if (isSet(fn)) {
            hooks[event].push(fn);
        }
        return $;
    }

    const isPattern$1 = isPattern;
    const toPattern = (pattern, opt) => {
        if (isPattern$1(pattern)) {
            return pattern;
        }
        // No need to escape `/` in the pattern string
        pattern = pattern.replace(/\//g, '\\/');
        return new RegExp(pattern, isSet(opt) ? opt : 'g');
    };

    var name = 'F3H',
        win = window,
        doc = document,
        GET = 'GET',
        POST = 'POST',
        responseTypeHTML = 'document',
        responseTypeJSON = 'json',
        responseTypeTXT = 'text',
        history = win.history,
        location = win.location,
        home = '//' + location.hostname,
        html = doc.documentElement,
        head,
        body,
        scriptCurrent = doc.currentScript;

    function attributeGet(node, key) {
      return node.getAttribute(key);
    }

    function attributeHas(node, key) {
      return node.hasAttribute(key);
    }

    function attributeSet(node, key, value) {
      return node.setAttribute(key, value);
    }

    function contentGet(node) {
      return node.innerHTML;
    }

    function contentSet(node, content) {
      node.innerHTML = content;
    }

    function eventGet(node) {
      return isForm(node) ? 'submit' : 'click';
    }

    function hashGet(ref) {
      return ref.split('#')[1] || "";
    }

    function hashLet(ref) {
      return ref.split('#')[0];
    }

    function isForm(node) {
      return 'form' === toCaseLower(node.nodeName);
    }

    function isLinkForF3H(node) {
      var n = toCaseLower(name); // Exclude `<link rel="*">` tag that contains `data-f3h` or `f3h` attribute

      if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
        return 1;
      }

      return 0;
    }

    function isScriptForF3H(node) {
      // Exclude this very JavaScript
      if (node.src && scriptCurrent.src === node.src) {
        return 1;
      }

      var n = toCaseLower(name); // Exclude JavaScript tag that contains `data-f3h` or `f3h` attribute

      if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
        return 1;
      } // Exclude JavaScript that contains `F3H` instantiation


      if (toPattern('\\b' + name + '\\b').test(contentGet(node) || "")) {
        return 1;
      }

      return 0;
    }

    function isStyleForF3H(node) {
      var n = toCaseLower(name); // Exclude CSS tag that contains `data-f3h` or `f3h` attribute

      if (attributeHas(node, 'data-' + n) || attributeHas(node, n)) {
        return 1;
      }

      return 0;
    }

    function linkGetAll(scope) {
      var id,
          out = {},
          link,
          links = nodeGetAll('link[rel=dns-prefetch],link[rel=preconnect],link[rel=prefetch],link[rel=preload],link[rel=prerender]', scope);

      for (var i = 0, j = links.length; i < j; ++i) {
        if (isLinkForF3H(link = links[i])) {
          continue;
        }

        link.id = id = link.id || name + ':' + toID(attributeGet(link, 'href') || contentGet(link));
        out[id] = nodeSave(link);
        out[id][2].href = link.href; // Use the resolved URL!
      }

      return out;
    }

    function nodeGet(query, scope, root) {
      return (scope || root || doc).querySelector(query);
    }

    function nodeGetAll(query, scope, root) {
      return (scope || root || doc).querySelectorAll(query);
    }

    function nodeInsert(node, before, scope) {
      scope.insertBefore(node, before && scope === before.parentNode ? before : null);
    }

    function nodeLet(node) {
      if (!node) {
        return;
      }

      var parent = node.parentNode;
      parent && parent.removeChild(node);
    }

    function nodeRestore(from) {
      var node = doc.createElement(from[0]);
      contentSet(node, from[1]);

      for (var k in from[2]) {
        attributeSet(node, k, fromValue(from[2][k]));
      }

      return node;
    }

    function nodeSave(node) {
      var attributes = node.attributes,
          // `[name, content, attributes]`
      out = [toCaseLower(node.nodeName), contentGet(node), {}];

      for (var i = 0, j = attributes.length; i < j; ++i) {
        out[2][attributes[i].name] = toValue(attributes[i].value);
      }

      return out;
    }

    function preventDefault(e) {
      e.preventDefault();
    }

    function refGet() {
      return location.href;
    }

    function scriptGetAll(scope) {
      var id,
          out = {},
          script,
          scripts = nodeGetAll('script', scope);

      for (var i = 0, j = scripts.length; i < j; ++i) {
        if (isScriptForF3H(script = scripts[i])) {
          continue;
        }

        script.id = id = script.id || name + ':' + toID(attributeGet(script, 'src') || contentGet(script));
        out[id] = nodeSave(script);
      }

      return out;
    } // Ignore trailing `/` character(s) in URL


    function slashEndLet(ref) {
      return ref.replace(/\/+$/, "");
    }

    function styleGetAll(scope) {
      var id,
          out = {},
          style,
          styles = nodeGetAll('link[rel=stylesheet],style', scope);

      for (var i = 0, j = styles.length; i < j; ++i) {
        if (isStyleForF3H(style = styles[i])) {
          continue;
        }

        style.id = id = style.id || name + ':' + toID(attributeGet(style, 'href') || contentGet(style));
        out[id] = nodeSave(style);
      }

      return out;
    }

    function targetGet(id, orName) {
      return id ? doc.getElementById(id) || (orName ? doc.getElementsByName(id)[0] : null) : null;
    }

    function toCaseLower(str) {
      return str.toLowerCase();
    }

    function toCaseUpper(str) {
      return str.toUpperCase();
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
        source = doc;
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
        source = doc;
      }

      $.state = Object.assign({}, F3H.state, true === state ? {
        cache: state
      } : state || {});
      $.source = source;
      var sources = sourcesGet($.state.sources);

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

      var ref = refGet(); // Store current URL to a variable to be compared to the next URL

      var refCurrent = ref;

      function sourcesGet(sources, root) {
        var froms = nodeGetAll(sources, root, $.source),
            refNow = refGet();

        if (isFunction($.state.is)) {
          var to = [];
          froms.forEach(function (from) {
            $.state.is.call($, from, refNow) && to.push(from);
          });
          return to;
        }

        return froms;
      } // Include submit button value to the form data ;)


      function doAppendCurrentButtonValue(node) {
        var buttonValueStorage = doc.createElement('input'),
            buttons = nodeGetAll('[name][type=submit][value]', node, $.source);
        buttonValueStorage.type = 'hidden';
        nodeInsert(buttonValueStorage, 0, node);
        buttons.forEach(function (button) {
          onEvent('click', button, function () {
            buttonValueStorage.name = this.name;
            buttonValueStorage.value = this.value;
          });
        });
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
        $.fire('exit', [doc, node]); // Get response from cache if any

        if ($.state.cache) {
          var cache = $.caches[slashEndLet(hashLet(ref))]; // `[status, response, lot, requestIsDocument]`

          if (cache) {
            $.lot = cache[2];
            $.status = cache[0];
            cache[3] && !nodeIsWindow && useHistory && doScrollTo(html);
            doRefChange(ref);
            data = [cache[1], node]; // Update `<link rel="*">` data for the next page

            cache[3] && ($.links = doUpdateLinks(data[0])); // Update CSS before markup change

            cache[3] && ($.styles = doUpdateStyles(data[0]));
            $.fire('success', data);
            $.fire(cache[0], data);
            sources = sourcesGet($.state.sources); // Update JavaScript after markup change

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
            status && ($.caches[slashEndLet(hashLet(ref))] = [status, request.response, lot, requestIsDocument]);
          }

          $.lot = lot;
          $.status = status;
        }

        onEvent('abort', request, function () {
          dataSet(), $.fire('abort', [request.response, node]);
        });
        onEvent('error', request, fn = function fn() {
          dataSet();
          requestIsDocument && !nodeIsWindow && useHistory && doScrollTo(html);
          data = [request.response, node]; // Update `<link rel="*">` data for the next page

          requestIsDocument && ($.links = doUpdateLinks(data[0])); // Update CSS before markup change

          requestIsDocument && ($.styles = doUpdateStyles(data[0]));
          $.fire('error', data);
          sources = sourcesGet($.state.sources); // Update JavaScript after markup change

          requestIsDocument && ($.scripts = doUpdateScripts(data[0]));
          onSourcesEventsSet(data);
          $.fire('enter', data);
        });
        onEvent('error', requestAsPush, fn);
        onEvent('load', request, fn = function fn() {
          dataSet();
          data = [request.response, node];
          redirect = request.responseURL; // Handle internal server-side redirection
          // <https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx>

          if (status >= 300 && status < 400) {
            // Redirection should delete a cache related to the response URL
            // This is useful for case(s) like, when you have submitted a
            // comment form and then you will be redirected to the same URL
            var r = slashEndLet(redirect);
            $.caches[r] && delete $.caches[r]; // Trigger hook(s) immediately

            $.fire('success', data);
            $.fire(status, data); // Do the normal fetch

            doFetch(nodeCurrent = win, GET, redirect || ref);
            return;
          } // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
          // if (GET === type) {


          doRefChange(-1 === ref.indexOf('#') ? redirect || ref : ref); // }
          // Update CSS before markup change

          requestIsDocument && ($.styles = doUpdateStyles(data[0]));
          $.fire('success', data);
          $.fire(status, data);
          requestIsDocument && useHistory && doScrollTo(html);
          sources = sourcesGet($.state.sources); // Update JavaScript after markup change

          requestIsDocument && ($.scripts = doUpdateScripts(data[0]));
          onSourcesEventsSet(data);
          $.fire('enter', data);
        });
        onEvent('load', requestAsPush, fn);
        onEvent('progress', request, function (e) {
          dataSet(), $.fire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
        });
        onEvent('progress', requestAsPush, function (e) {
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

        var target = nodeGet('[autofocus]', $.source);
        target && target.focus();
      } // Pre-fetch page and store it into cache


      function doPreFetch(node, ref) {
        var request = doFetchBase(node, GET, ref),
            status;
        onEvent('load', request, function () {
          if (200 === (status = request.status)) {
            $.caches[slashEndLet(hashLet(ref))] = [status, request.response, toHeadersAsProxy(request), responseTypeHTML === request.responseType];
          }
        });
      }

      function doPreFetchElement(node) {
        onEvent('mousemove', node, onHoverOnce);
      }

      function doRefChange(ref) {
        if (ref === refGet()) {
          return; // Clicking on the same URL should trigger the AJAX call. Just don’t duplicate it to the history!
        }

        $.state.history && history.pushState({}, "", ref);
      }

      function doScrollTo(node) {
        if (!node) {
          return;
        }

        html.scrollLeft = body.scrollLeft = node.offsetLeft;
        html.scrollTop = body.scrollTop = node.offsetTop;
      } // Scroll to the first element with `id` or `name` attribute that has the same value as location hash


      function doScrollToElement(data) {
        if ($.hooks.scroll) {
          $.fire('scroll', data);
          return;
        }

        doScrollTo(targetGet(hashGet(refGet()), 1));
      }

      function doUpdate(compare, to, getAll, defaultContainer) {
        var id,
            toCompare = getAll(compare),
            node,
            placesToRestore = {},
            v;

        for (id in to) {
          if (node = nodeGet('#' + id.replace(/[:.]/g, '\\$&'), $.source)) {
            placesToRestore[id] = node.nextElementSibling;
          }

          if (!toCompare[id]) {
            delete to[id];
            nodeLet(targetGet(id));
          }
        }

        for (id in toCompare) {
          if (!to[id]) {
            to[id] = v = toCompare[id];
            nodeInsert(nodeRestore(v), placesToRestore[id], defaultContainer);
          }
        }

        return to;
      }

      function doUpdateLinks(compare) {
        return doUpdate(compare, $.links, linkGetAll, head);
      }

      function doUpdateScripts(compare) {
        return doUpdate(compare, $.scripts, scriptGetAll, body);
      }

      function doUpdateStyles(compare) {
        return doUpdate(compare, $.styles, styleGetAll, head);
      }

      function onDocumentReady() {
        // Detect key down/up event
        onEvent('keydown', doc, onKeyDown);
        onEvent('keyup', doc, onKeyUp); // Set body and head variable value once, on document ready

        body = doc.body;
        head = doc.head; // Make sure all element(s) are captured on document ready

        $.links = linkGetAll();
        $.scripts = scriptGetAll();
        $.styles = styleGetAll();
        onSourcesEventsSet([doc, win]); // Store the initial page into cache

        $.state.cache && doPreFetch(win, refGet());
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
            refNow = href || action,
            type = toCaseUpper(t.method || GET);

        if (GET === type) {
          if (isForm(t)) {
            q = new URLSearchParams(new FormData(t)) + "";
            refNow = slashEndLet(refNow.split(/[?&#]/)[0]) + (q ? '?' + q : "");
          } // Immediately change the URL if turbo feature is enabled


          if ($.state.turbo) {
            doRefChange(refNow);
          }
        }

        $.requests[refNow] = [doFetch(t, type, refNow), t];
        preventDefault(e);
      }

      function onHashChange(e) {
        doScrollTo(targetGet(hashGet(refGet()), 1));
        preventDefault(e);
      } // Pre-fetch URL on link hover


      function onHoverOnce() {
        var t = this,
            href = t.href;

        if (!$.caches[slashEndLet(hashLet(href))]) {
          doPreFetch(t, href);
        }

        offEvent('mousemove', t, onHoverOnce);
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
        var refNow = refGet(); // Updating the hash value shouldn’t trigger the AJAX call!

        if (hashGet(refNow) && hashLet(refCurrent) === hashLet(refNow)) {
          return;
        }

        $.requests[refNow] = [doFetch(win, GET, refNow), win];
      }

      function onSourcesEventsLet() {
        sources.forEach(function (source) {
          onEvent(eventGet(source), source, onFetch);
        });
      }

      function onSourcesEventsSet(data) {
        var turbo = $.state.turbo;
        sources.forEach(function (source) {
          onEvent(eventGet(source), source, onFetch);

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
      $.off = off.bind($);
      $.on = on.bind($);

      $.pop = function () {
        onSourcesEventsLet();
        offEvent('DOMContentLoaded', win, onDocumentReady);
        offEvent('hashchange', win, onHashChange);
        offEvent('keydown', doc, onKeyDown);
        offEvent('keyup', doc, onKeyUp);
        offEvent('popstate', win, onPopState);
        $.fire('pop', [doc, win]);
        return $.abort();
      };

      onEvent('DOMContentLoaded', win, onDocumentReady);
      onEvent('hashchange', win, onHashChange);
      onEvent('popstate', win, onPopState);
      return $;
    }

    F3H.instances = {};
    F3H.state = {
      'cache': false,
      // Store all response body to variable to be used later?
      'history': true,
      'is': function is(source, refNow) {
        var target = source.target,
            // Get URL data as-is from the DOM attribute string
        raw = attributeGet(source, 'href') || attributeGet(source, 'action') || "",
            // Get resolved URL data from the DOM property
        value = source.href || source.action || "";

        if (target && '_self' !== target) {
          return false;
        } // Exclude URL contains hash only, and any URL prefixed by `data:`, `javascript:` and `mailto:`


        if ('#' === raw[0] || /^(data|javascript|mailto):/.test(raw)) {
          return false;
        } // If `value` is the same as current URL excluding the hash, treat `raw` as hash only,
        // so that we don’t break the native hash change event that you may want to add in the future


        if (hashGet(value) && hashLet(refNow) === hashLet(value)) {
          return false;
        } // Detect internal link starts from here


        return "" === raw || 0 === raw.search(/[.\/?]/) || 0 === raw.indexOf(home) || 0 === raw.indexOf(location.protocol + home) || -1 === raw.indexOf('://');
      },
      'lot': {
        'x-requested-with': name
      },
      'ref': function ref(source, refNow) {
        return refNow;
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
    F3H.version = '1.1.1';

    return F3H;

}());
