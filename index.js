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
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.F3H = factory());
})(this, function () {
  'use strict';

  var isArray = function isArray(x) {
    return Array.isArray(x);
  };

  var isBoolean = function isBoolean(x) {
    return false === x || true === x;
  };

  var isDefined = function isDefined(x) {
    return 'undefined' !== typeof x;
  };

  var isFunction = function isFunction(x) {
    return 'function' === typeof x;
  };

  var isInstance = function isInstance(x, of) {
    return x && isSet(of) && x instanceof of;
  };

  var isNull = function isNull(x) {
    return null === x;
  };

  var isNumeric = function isNumeric(x) {
    return /^-?(?:\d*.)?\d+$/.test(x + "");
  };

  var isObject = function isObject(x, isPlain) {
    if (isPlain === void 0) {
      isPlain = true;
    }

    if ('object' !== typeof x) {
      return false;
    }

    return isPlain ? isInstance(x, Object) : true;
  };

  var isSet = function isSet(x) {
    return isDefined(x) && !isNull(x);
  };

  var isString = function isString(x) {
    return 'string' === typeof x;
  };

  var fromValue = function fromValue(x) {
    if (isArray(x)) {
      return x.map(function (v) {
        return fromValue(x);
      });
    }

    if (isObject(x)) {
      for (var k in x) {
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

  var toCaseLower = function toCaseLower(x) {
    return x.toLowerCase();
  };

  var toNumber = function toNumber(x, base) {
    if (base === void 0) {
      base = 10;
    }

    return parseInt(x, base);
  };

  var toValue = function toValue(x) {
    if (isArray(x)) {
      return x.map(function (v) {
        return toValue(v);
      });
    }

    if (isNumeric(x)) {
      return toNumber(x);
    }

    if (isObject(x)) {
      for (var k in x) {
        x[k] = toValue(x[k]);
      }

      return x;
    }

    return {
      'false': false,
      'null': null,
      'true': true
    }[x] || x;
  };

  var D = document;
  var W = window;
  var R = D.documentElement;

  var fromElement = function fromElement(node) {
    var attributes = getAttributes(node),
        content = getHTML(node),
        title = getName(node);
    return false !== content ? [title, content, attributes] : [title, attributes];
  };

  var getAttribute = function getAttribute(node, attribute, parseValue) {
    if (parseValue === void 0) {
      parseValue = true;
    }

    if (!hasAttribute(node, attribute)) {
      return null;
    }

    var value = node.getAttribute(attribute);
    return parseValue ? toValue(value) : value;
  };

  var getAttributes = function getAttributes(node, parseValue) {
    if (parseValue === void 0) {
      parseValue = true;
    }

    var attributes = node.attributes,
        value,
        values = {};

    for (var i = 0, j = attributes.length; i < j; ++i) {
      value = attributes[i].value;
      values[attributes[i].name] = parseValue ? toValue(value) : value;
    }

    return values;
  };

  var getElement = function getElement(query, scope) {
    return (scope || D).querySelector(query);
  };

  var getElements = function getElements(query, scope) {
    return (scope || D).querySelectorAll(query);
  };

  var getHTML = function getHTML(node, trim) {
    if (trim === void 0) {
      trim = true;
    }

    var state = 'innerHTML';

    if (!hasState(node, state)) {
      return false;
    }

    var content = node[state];
    content = trim ? content.trim() : content;
    return "" !== content ? content : null;
  };

  var getName = function getName(node) {
    return toCaseLower(node && node.nodeName || "") || null;
  };

  var getNext = function getNext(node) {
    return node.nextElementSibling || null;
  };

  var getParent = function getParent(node) {
    return node.parentNode || null;
  };

  var getText = function getText(node, trim) {
    if (trim === void 0) {
      trim = true;
    }

    var state = 'textContent';

    if (!hasState(node, state)) {
      return false;
    }

    var content = node[state];
    content = trim ? content.trim() : content;
    return "" !== content ? content : null;
  };

  var hasAttribute = function hasAttribute(node, attribute) {
    return node.hasAttribute(attribute);
  };

  var hasParent = function hasParent(node) {
    return null !== getParent(node);
  };

  var hasState = function hasState(node, state) {
    return state in node;
  };

  var isWindow = function isWindow(node) {
    return node === W;
  };

  var letAttribute = function letAttribute(node, attribute) {
    return node.removeAttribute(attribute), node;
  };

  var letElement = function letElement(node) {
    var parent = getParent(node);
    return node.remove(), parent;
  };

  var setAttribute = function setAttribute(node, attribute, value) {
    if (true === value) {
      value = attribute;
    }

    return node.setAttribute(attribute, fromValue(value)), node;
  };

  var setAttributes = function setAttributes(node, attributes) {
    var value;

    for (var attribute in attributes) {
      value = attributes[attribute];

      if (value || "" === value || 0 === value) {
        setAttribute(node, attribute, value);
      } else {
        letAttribute(node, attribute);
      }
    }

    return node;
  };

  var setChildLast = function setChildLast(parent, node) {
    return parent.append(node), node;
  };

  var setElement = function setElement(node, content, attributes) {
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

  var setHTML = function setHTML(node, content, trim) {
    if (trim === void 0) {
      trim = true;
    }

    if (null === content) {
      return node;
    }

    var state = 'innerHTML';
    return hasState(node, state) && (node[state] = trim ? content.trim() : content), node;
  };

  var setPrev = function setPrev(current, node) {
    return getParent(current).insertBefore(node, current), node;
  };

  var toElement = function toElement(fromArray) {
    return setElement.apply(void 0, fromArray);
  };

  var theHistory = W.history;
  var theLocation = W.location;
  var theScript = D.currentScript;

  var eventPreventDefault = function eventPreventDefault(e) {
    return e && e.preventDefault();
  };

  var off = function off(name, node, then) {
    node.removeEventListener(name, then);
  };

  var on = function on(name, node, then, options) {
    if (options === void 0) {
      options = false;
    }

    node.addEventListener(name, then, options);
  };

  var fromStates = function fromStates() {
    for (var _len = arguments.length, lot = new Array(_len), _key = 0; _key < _len; _key++) {
      lot[_key] = arguments[_key];
    }

    return Object.assign.apply(Object, [{}].concat(lot));
  };

  function context($) {
    var hooks = {};

    function fire(name, data) {
      if (!isSet(hooks[name])) {
        return $;
      }

      hooks[name].forEach(function (then) {
        return then.apply($, data);
      });
      return $;
    }

    function off(name, then) {
      if (!isSet(name)) {
        return hooks = {}, $;
      }

      if (isSet(hooks[name])) {
        if (isSet(then)) {
          for (var i = 0, _j = hooks[name].length; i < _j; ++i) {
            if (then === hooks[name][i]) {
              hooks[name].splice(i, 1);
              break;
            }
          } // Clean-up empty hook(s)


          if (0 === j) {
            delete hooks[name];
          }
        } else {
          delete hooks[name];
        }
      }

      return $;
    }

    function on(name, then) {
      if (!isSet(hooks[name])) {
        hooks[name] = [];
      }

      if (isSet(then)) {
        hooks[name].push(then);
      }

      return $;
    }

    $.hooks = hooks;
    $.fire = fire;
    $.off = off;
    $.on = on;
    return $;
  }

  var $ = context({});
  var fire = $.fire;
  var off$1 = $.off;
  var on$1 = $.on;
  var hooks = $.hooks;

  var isPattern = function isPattern(pattern) {
    return isInstance(pattern, RegExp);
  };

  var toPattern = function toPattern(pattern, opt) {
    if (isPattern(pattern)) {
      return pattern;
    } // No need to escape `/` in the pattern string


    pattern = pattern.replace(/\//g, '\\/');
    return new RegExp(pattern, isSet(opt) ? opt : 'g');
  };

  var getOffset = function getOffset(node) {
    return [node.offsetLeft, node.offsetTop];
  };

  var setScroll = function setScroll(node, data) {
    node.scrollLeft = data[0];
    node.scrollTop = data[1];
    return node;
  };

  var toCaseLower$1 = function toCaseLower(x) {
    return x.toLowerCase();
  };

  var toCaseUpper = function toCaseUpper(x) {
    return x.toUpperCase();
  };

  var toCount = function toCount(x) {
    return x.length;
  };

  var toNumber$1 = function toNumber(x, base) {
    if (base === void 0) {
      base = 10;
    }

    return base ? parseInt(x, base) : parseFloat(x);
  };

  var toObjectCount = function toObjectCount(x) {
    return toCount(toObjectKeys(x));
  };

  var toObjectKeys = function toObjectKeys(x) {
    return Object.keys(x);
  };

  var toValue$1 = function toValue(x) {
    if (isArray(x)) {
      return x.map(function (v) {
        return toValue(v);
      });
    }

    if (isNumeric(x)) {
      return toNumber$1(x);
    }

    if (isObject(x)) {
      for (var k in x) {
        x[k] = toValue(x[k]);
      }

      return x;
    }

    return {
      'false': false,
      'null': null,
      'true': true
    }[x] || x;
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
        href,
        link,
        links = getElements('link[rel=dns-prefetch],link[rel=preconnect],link[rel=prefetch],link[rel=preload],link[rel=prerender]', scope),
        toSave;

    for (var i = 0, j = toCount(links); i < j; ++i) {
      if (isLinkForF3H(link = links[i])) {
        continue;
      }

      href = getAttribute(link, 'href');
      link.id = id = link.id || name + ':' + toID(href || getText(link));
      out[id] = toSave = fromElement(link);

      if (href) {
        out[id][toCount(toSave) - 1].href = link.href; // Use the resolved URL!
      }
    }

    return out;
  }

  function getRef() {
    return letSlashEnd(theLocation.href);
  }

  function getScripts(scope) {
    var id,
        out = {},
        src,
        script,
        scripts = getElements('script', scope),
        toSave;

    for (var i = 0, j = toCount(scripts); i < j; ++i) {
      if (isScriptForF3H(script = scripts[i])) {
        continue;
      }

      src = getAttribute(script, 'src');
      script.id = id = script.id || name + ':' + toID(src || getText(script));
      out[id] = toSave = fromElement(script);

      if (src) {
        out[id][toCount(toSave) - 1].src = script.src; // Use the resolved URL!
      }
    }

    return out;
  }

  function getStyles(scope) {
    var id,
        out = {},
        href,
        style,
        styles = getElements('link[rel=stylesheet],style', scope),
        toSave;

    for (var i = 0, j = toCount(styles); i < j; ++i) {
      if (isStyleForF3H(style = styles[i])) {
        continue;
      }

      href = getAttribute(style, 'href');
      style.id = id = style.id || name + ':' + toID(href || getText(style));
      out[id] = toSave = fromElement(style);

      if (href) {
        out[id][toCount(toSave) - 1].href = style.href; // Use the resolved URL!
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
    var n = toCaseLower$1(name); // Exclude `<link rel="*">` tag that contains `data-f3h` or `f3h` attribute with `false` value

    return toValue$1(getAttribute(node, 'data-' + n) || getAttribute(node, n)) ? 1 : 0;
  }

  function isScriptForF3H(node) {
    // Exclude this very JavaScript
    if (node.src && theScript.src === node.src) {
      return 1;
    }

    var n = toCaseLower$1(name); // Exclude JavaScript tag that contains `data-f3h` or `f3h` attribute with `false` value

    if (toValue$1(getAttribute(node, 'data-' + n) || getAttribute(node, n))) {
      return 1;
    } // Exclude JavaScript that contains `F3H` instantiation


    if (toPattern('\\b' + name + '\\b').test(getText(node) || "")) {
      return 1;
    }

    return 0;
  }

  function isSourceForF3H(node) {
    var n = toCaseLower$1(name);

    if (!hasAttribute(node, 'data-' + n) && !hasAttribute(node, n)) {
      return 1; // Default value is `true`
    } // Exclude anchor tag that contains `data-f3h` or `f3h` attribute with `false` value


    return toValue$1(getAttribute(node, 'data-' + n) || getAttribute(node, n)) ? 1 : 0;
  }

  function isStyleForF3H(node) {
    var n = toCaseLower$1(name); // Exclude CSS tag that contains `data-f3h` or `f3h` attribute with `false` value

    return toValue$1(getAttribute(node, 'data-' + n) || getAttribute(node, n)) ? 1 : 0;
  }

  function letHash(ref) {
    return ref.split('#')[0];
  } // Ignore trailing `/` character(s) in URL


  function letSlashEnd(ref) {
    return ref.replace(/\/+(?=[?&#]|$)/, "");
  } // <https://stackoverflow.com/a/8831937/1163000>


  function toID(text) {
    var c,
        i,
        j = toCount(text),
        out = 0;

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
        k;

    for (header in headers) {
      h = headers[header].split(': ');
      k = toCaseLower$1(h.shift());
      out[k] = toValue$1(h.join(': '));
    } // Use proxy to make case-insensitive response header’s key


    return new Proxy(out, {
      get: function get(o, k) {
        return o[toCaseLower$1(k)] || null;
      },
      set: function set(o, k, v) {
        o[toCaseLower$1(k)] = v;
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
    } // Already instantiated, skip!


    if (source[name]) {
      return;
    }

    $.state = state = fromStates(F3H.state, true === state ? {
      cache: state
    } : state || {});
    $.source = source;

    if (state.turbo) {
      state.cache = true; // Enable turbo feature will force enable cache feature
    }

    var caches = {},
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

    var _contextHook = context($),
        fire = _contextHook.fire,
        hooks = _contextHook.hooks; // Store current instance to `F3H.instances`


    F3H.instances[source.id || source.name || toObjectCount(F3H.instances)] = $; // Mark current DOM as active to prevent duplicate instance

    source[name] = 1;

    function getSources(sources, root) {
      ref = getRef();
      var froms = getElements(sources, root),
          to = [];

      if (isFunction(state.is)) {
        froms.forEach(function (from) {
          state.is.call($, from, ref) && isSourceForF3H(from) && to.push(from);
        });
      } else {
        froms.forEach(function (from) {
          isSourceForF3H(from) && to.push(from);
        });
      }

      return to;
    } // Include submit button value to the form data ;)


    function doAppendCurrentButtonValue(node) {
      var buttonValueStorage = setElement('input', {
        type: 'hidden'
      }),
          buttons = getElements('[name][type=submit][value]', node);
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

      state.history && theHistory.pushState({}, "", ref);
    }

    function doFetch(node, type, ref) {
      var nodeIsWindow = isWindow(node),
          useHistory = state.history,
          data; // Compare currently selected source element with the previously stored source element, unless it is a window.
      // Pressing back/forward button from the window shouldn’t be counted as accidental click(s) on the same source element

      if (GET === type && node === nodeCurrent && !nodeIsWindow) {
        return; // Accidental click(s) on the same source element should cancel the request!
      }

      nodeCurrent = node; // Store currently selected source element to a variable to be compared later

      $.ref = letSlashEnd(refCurrent = ref);
      fire('exit', [D, node]); // Get response from cache if any

      if (state.cache) {
        var cache = caches[letSlashEnd(letHash(ref))]; // `[status, response, lot, requestIsDocument]`

        if (cache) {
          $.lot = lot = cache[2];
          $.status = status = cache[0];
          cache[3] && !nodeIsWindow && useHistory && doScrollTo(R);
          doChangeRef(ref);
          data = [cache[1], node]; // Update `<link rel="*">` data for the next page

          cache[3] && (links = doUpdateLinks(data[0])); // Update CSS before markup change

          cache[3] && (styles = doUpdateStyles(data[0]));
          fire('success', data);
          fire(cache[0], data);
          sources = getSources(state.sources); // Update JavaScript after markup change

          cache[3] && (scripts = doUpdateScripts(data[0]));
          onSourcesEventsSet(data);
          fire('enter', data);
          return;
        }
      }

      var fn,
          redirect,
          request = doFetchBase(node, type, ref, state.lot),
          requestAsPush = request.upload,
          requestIsDocument = responseTypeHTML === request.responseType;

      function dataSet() {
        // Store response from GET request(s) to cache
        lot = toHeadersAsProxy(request);
        status = request.status;

        if (GET === type && state.cache) {
          // Make sure `status` is not `0` due to the request abortion, to prevent `null` response being cached
          status && (caches[letSlashEnd(letHash(ref))] = [status, request.response, lot, requestIsDocument]);
        }

        $.lot = lot;
        $.status = status;
      }

      on('abort', request, function () {
        dataSet(), fire('abort', [request.response, node]);
      });
      on('error', request, fn = function fn() {
        dataSet();
        requestIsDocument && !nodeIsWindow && useHistory && doScrollTo(R);
        data = [request.response, node]; // Update `<link rel="*">` data for the next page

        requestIsDocument && (links = doUpdateLinks(data[0])); // Update CSS before markup change

        requestIsDocument && (styles = doUpdateStyles(data[0]));
        fire('error', data);
        sources = getSources(state.sources); // Update JavaScript after markup change

        requestIsDocument && (scripts = doUpdateScripts(data[0]));
        onSourcesEventsSet(data);
        fire('enter', data);
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
          var r = letSlashEnd(letHash(redirect));
          caches[r] && delete caches[r]; // Trigger hook(s) immediately

          fire('success', data);
          fire(status, data); // Do the normal fetch

          doFetch(nodeCurrent = W, GET, redirect || ref);
          return;
        } // Just to be sure. Don’t worry, this wouldn’t make a duplicate history
        // if (GET === type) {


        doChangeRef(-1 === ref.indexOf('#') ? redirect || ref : ref); // }
        // Update CSS before markup change

        requestIsDocument && (styles = doUpdateStyles(data[0]));
        fire('success', data);
        fire(status, data);
        requestIsDocument && useHistory && doScrollTo(R);
        sources = getSources(state.sources); // Update JavaScript after markup change

        requestIsDocument && (scripts = doUpdateScripts(data[0]));
        onSourcesEventsSet(data);
        fire('enter', data);
      });
      on('load', requestAsPush, fn);
      on('progress', request, function (e) {
        dataSet(), fire('pull', e.lengthComputable ? [e.loaded, e.total] : [0, -1]);
      });
      on('progress', requestAsPush, function (e) {
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
      for (var request in requests) {
        doFetchAbort(request);
      }
    } // TODO: Change to the modern `window.fetch` function when it is possible to track download and upload progress!


    function doFetchBase(node, type, ref, headers) {
      ref = isFunction(state.ref) ? state.ref.call($, node, ref) : ref;
      var header,
          request = new XMLHttpRequest(); // Automatic response type based on current file extension

      var x = toCaseUpper(ref.split(/[?&#]/)[0].split('/').pop().split('.')[1] || ""),
          responseType = state.types[x] || state.type || responseTypeTXT;

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
      if (hooks.focus) {
        fire('focus', data);
        return;
      }

      var target = getElement('[autofocus]', source);
      target && target.focus();
    } // Pre-fetch page and store it into cache


    function doPreFetch(node, ref) {
      var request = doFetchBase(node, GET, ref);
      on('load', request, function () {
        if (200 === (status = request.status)) {
          caches[letSlashEnd(letHash(ref))] = [status, request.response, toHeadersAsProxy(request), responseTypeHTML === request.responseType];
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

      var theOffset = getOffset(node);
      setScroll(B, theOffset);
      setScroll(R, theOffset);
    } // Scroll to the first element with `id` or `name` attribute that has the same value as location hash


    function doScrollToElement(data) {
      if (hooks.scroll) {
        fire('scroll', data);
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
        if (node = getElement('#' + id.replace(/[:.]/g, '\\$&'), source)) {
          placesToRestore[id] = getNext(node);
        }

        if (!toCompare[id]) {
          delete to[id];
          var target = getTarget(id);
          target && letElement(target);
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
      return doUpdate(compare, links, getLinks, H);
    }

    function doUpdateScripts(compare) {
      return doUpdate(compare, scripts, getScripts, B);
    }

    function doUpdateStyles(compare) {
      return doUpdate(compare, styles, getStyles, H);
    }

    function onDocumentReady() {
      // Detect key down/up event
      on('keydown', D, onKeyDown);
      on('keyup', D, onKeyUp); // Set body and head variable value once, on document ready

      B = D.body;
      H = D.head; // Make sure all element(s) are captured on document ready

      $.links = links = getLinks();
      $.scripts = scripts = getScripts();
      $.styles = styles = getStyles();
      onSourcesEventsSet([D, W]); // Store the initial page into cache

      state.cache && doPreFetch(W, getRef());
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
          ref = letSlashEnd(href || action),
          type = toCaseUpper(t.method || GET);

      if (GET === type) {
        if (isForm(t)) {
          q = new URLSearchParams(new FormData(t)) + "";
          ref = ref.split(/[?&#]/)[0] + (q ? '?' + q : "");
        } // Immediately change the URL if turbo feature is enabled


        if (state.turbo) {
          doChangeRef(ref);
        }
      }

      requests[ref] = [doFetch(t, type, ref), t];
      eventPreventDefault(e);
    }

    function onHashChange(e) {
      doScrollTo(getTarget(getHash(getRef()), 1));
      eventPreventDefault(e);
    } // Pre-fetch URL on link hover


    function onHoverOnce() {
      var t = this,
          href = t.href;

      if (!caches[letSlashEnd(letHash(href))]) {
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
      ref = getRef();
      doFetchAbortAll(); // Updating the hash value shouldn’t trigger the AJAX call!

      if (getHash(ref) && letHash(refCurrent) === letHash(ref)) {
        return;
      }

      requests[ref] = [doFetch(W, GET, ref), W];
    }

    function onSourcesEventsLet() {
      sources.forEach(function (source) {
        on(getEventName(source), source, onFetch);
      });
    }

    function onSourcesEventsSet(data) {
      var turbo = state.turbo;
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
      } else if (requests[request]) {
        doFetchAbort(request);
      }

      return $;
    };

    $.caches = caches;

    $.fetch = function (ref, type, from) {
      return doFetchBase(from, type, ref);
    };

    $.links = links;
    $.lot = null;
    $.ref = null;
    $.scripts = scripts;
    $.state = state;
    $.styles = styles;
    $.status = null;

    $.pop = function () {
      if (!source[name]) {
        return $; // Already ejected!
      }

      delete source[name];
      onSourcesEventsLet();
      off('DOMContentLoaded', W, onDocumentReady);
      off('hashchange', W, onHashChange);
      off('keydown', D, onKeyDown);
      off('keyup', D, onKeyUp);
      off('popstate', W, onPopState);
      fire('pop', [D, W]);
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
    'is': function is(source, ref) {
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


      if (getHash(value) && letHash(ref) === letHash(value)) {
        return false;
      } // Detect internal link starts from here


      return "" === raw || 0 === raw.search(/[.\/?]/) || 0 === raw.indexOf(home) || 0 === raw.indexOf(theLocation.protocol + home) || -1 === raw.indexOf('://');
    },
    'lot': {
      'x-requested-with': name
    },
    'ref': function ref(source, _ref) {
      return _ref;
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
  F3H.version = '1.1.15';
  return F3H;
});
