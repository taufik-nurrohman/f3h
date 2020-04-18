<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width" name="viewport">
    <title>Home</title>
  </head>
  <body>
    <main>
      <p><a href="test.php?r=..%2Fexample-0%2Findex.html">Go to Example 0</a> &middot; <a href="test.php?r=https://example.com">Go to External Site</a></p>
    </main>
    <script src="../f3h.min.js"></script>
    <script>

    var f3h = new F3H,
        main = document.querySelector('main');

    f3h.on('error', function(response, source) {
        // Force page change
        window.location.href = source.href || source.action;
    });

    f3h.on('success', function(response) {
        document.title = response.title;
        main.innerHTML = response.querySelector('main').innerHTML;
    });

    </script>
  </body>
</html>
