F3H: Fetch
==========

> Load pages asynchronously using AJAX while maintaining the principles of progressive enhancement.

[Demo](https://taufik-nurrohman.github.io/f3h)

Your job is to make a website that works traditionally: clicking on a link will direct you to a new page, sending and uploading data through a form will save those data into the web storage. After you finish making it, this application will serve as a feature enhancer, which is, to enable AJAX features to your traditional web pages automatically, so that your web pages can load faster because you can specify which parts of the destination page you want to load into the current page.

---

Release Notes
-------------

### 1.0.x

 - Reset cached page&rsquo;s scroll position on normal click or submit events.
 - Added `state.type` option as the default response type for URL path with a file extension that is not defined in `state.types`.

### 1.0.7

 - Fixed double redirection bug.

### 1.0.6

 - Include `<link rel="dns-prefetch">`, `<link rel="preconnect">`, `<link rel="preload">` and `<link rel="prerender">` to the `f3h.links` as well.
 - Fixed custom headers defined in `state.lot` not being sent to the request headers.
 - Added jQuery example.

### 1.0.5

 - Fixed generic search form not appending search query in URL.

### 1.0.4

 - Improved native HTML5 prefetch.
 - Added `f3h.links` property to store the available links to prefetch in the current response.

### 1.0.3

 - Fixed scroll restoration bug, again.
 - Added ability to add/remove external CSS and JavaScript files automatically by comparing between current document&rsquo;s scripts and styles and response document&rsquo;s scripts and styles.
 - Added ability to add/remove inline CSS and JavaScript code automatically by comparing between current document&rsquo;s scripts and styles and response document&rsquo;s scripts and styles. No need to modify your Google AdSense code. Yay!

### 1.0.2

 - Fixed scroll restoration bug on history back.
 - Removed `f3h.sources` property since it was never generated in live unless you have put the response body to the current document. But when it is generated, it was too late.
 - Added turbo feature that allows users to pre-fetch link URL on hover by setting the `state.turbo` to `true`.

### 1.0.1

 - Response headers are now case-insensitive.
 - Clicking on the same source element multiple times should trigger the AJAX call once.
 - Added local cache feature which can be enabled by setting the `state.cache` value to `true`.

### 1.0.0

 - Initial release.
