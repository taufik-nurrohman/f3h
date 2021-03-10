F3H: Fetch
==========

> Load pages asynchronously using AJAX while maintaining the principles of progressive enhancement.

[Demo and Documentation](https://taufik-nurrohman.github.io/f3h)

Your job is to make a website that works traditionally: clicking on a link will direct you to a new page, sending and uploading data through a form will save those data into the web storage. After you finish making it, this application will serve as a feature enhancer, which is, to enable AJAX features to your traditional web pages automatically, so that your web pages can load faster because you can specify which parts of the destination page you want to load into the current page.

Contribute
----------

 - **Please do not make pull requests by editing the files that are in the root of the project. They are generated automatically by the build tool.**
 - Install [Git](https://en.wikipedia.org/wiki/Git) and [Node.js](https://en.wikipedia.org/wiki/Node.js)
 - Run `git clone https://github.com/taufik-nurrohman/f3h.git`
 - Run `cd f3h && npm install`
 - Edit the files in the `.source/-` folder.
 - Run `npm run pack` to generate the production ready files.

---

Release Notes
-------------

### 1.1.16

 - Allowed to disable AJAX features by adding `data-f3h` or `f3h` attribute with `false` value to the source elements.

### 1.1.14

 - Maintenance.

### 1.1.11

 - Restructured the test files.

### 1.1.10

 - Maintenance.

### 1.1.4

 - Added `@taufik-nurrohman/document` as development dependency.

### 1.1.3

 - Added `@taufik-nurrohman/file` and `@taufik-nurrohman/folder` as development dependency.
 - Output file for the browser is now using the [Universal Module Definition](https://github.com/umdjs/umd) format.

### 1.1.2

 - Removed `read-package-json` development dependency.

### 1.1.1

 - Removed all CLI dependencies (use the available JavaScript API where possible).

### 1.1.0

 - Prioritized maintainability over file size. Say hello to Node.js and ES6! :wave:

### 1.0.18

 - Preserved native web features where possible (#11)

### 1.0.17

 - Modernized syntax.

### 1.0.16

 - Removed `F3H._` method.

### 1.0.15

 - Small bug fixes.

### 1.0.14

 - Small bug fixes.
 - Updated the donation target.

### 1.0.13

 - Immediately change the URL when leaving the page if turbo feature is enabled.

### 1.0.12

 - Fixed URL contains hash being redirected to the non-hash version.
 - Fixed search form with custom action URL not capturing the search query on the next search.

### 1.0.11

 - Fixed bug of undefined `f3h.links`, `f3h.scripts` and `f3h.styles` property.

### 1.0.10

 - Fixed common issue with ES6 module which does not reference the `this` scope to `window` object by default.
 - Reset scroll position after updating the results.

### 1.0.9

 - Fixed a bug where JavaScript elements below the `F3H` instance are not captured on the first instantiation. Need to capture it after the document is ready.
 - Fixed server-side redirection&rsquo;s response URL that does not change the URL in address bar after redirection.

### 1.0.8

 - Added `state.type` option as the default response type to be applied to the destination URL with a file extension that&rsquo;s not yet listed in the `state.types` object.
 - Reset cached page&rsquo;s scroll position on normal click and/or submit events.

### 1.0.7

 - Fixed double redirection bug.

### 1.0.6

 - Added jQuery example.
 - Fixed custom headers defined in `state.lot` not being sent to the request headers.
 - Include `<link rel="dns-prefetch">`, `<link rel="preconnect">`, `<link rel="preload">` and `<link rel="prerender">` to the `f3h.links` as well.

### 1.0.5

 - Fixed generic search form not appending search query in URL.

### 1.0.4

 - Added `f3h.links` property to store the available links to prefetch in the current response.
 - Improved native HTML5 prefetch.

### 1.0.3

 - Added ability to add/remove external CSS and JavaScript files automatically by comparing between current document&rsquo;s scripts and styles and response document&rsquo;s scripts and styles.
 - Added ability to add/remove inline CSS and JavaScript code automatically by comparing between current document&rsquo;s scripts and styles and response document&rsquo;s scripts and styles. No need to modify your Google AdSense code. Yay!
 - Fixed scroll restoration bug, again.

### 1.0.2

 - Added turbo feature that allows users to pre-fetch link URL on hover by setting the `state.turbo` to `true`.
 - Fixed scroll restoration bug on history back.
 - Removed `f3h.sources` property since it was never generated in live unless you have put the response body to the current document. But when it is generated, it was too late.

### 1.0.1

 - Added local cache feature which can be enabled by setting the `state.cache` option value to `true`.
 - Clicking on the same source element multiple times should trigger the AJAX call once.
 - Response headers are now case-insensitive.

### 1.0.0

 - Initial release.
