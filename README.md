F3H: Fetch
==========

> Load pages asynchronously using AJAX while maintaining the principles of progressive enhancement.

[Demo](https://taufik-nurrohman.github.io/f3h)

Your job is to make a website that works traditionally: clicking on a link will direct you to a new page, sending and uploading data through a form will save those data into the web storage. After you finish making it, this application will serve as a feature enhancer, which is, to enable AJAX features to your traditional web pages automatically, so that your web pages can load faster because you can specify which parts of the destination page you want to load into the current page.

---

Release Notes
-------------

### 1.0.1

 - Response headers is now case-insensitive.
 - Clicking on the same source element multiple times should trigger the AJAX request once.
 - Added local cache feature which can be enabled by setting the `state.cache` value to `true`.

### 1.0.0

 - Initial release.
