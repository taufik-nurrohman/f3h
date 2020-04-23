<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width" name="viewport">
    <title>Home</title>
  </head>
  <body>
    <main>
      <?php if ('POST' === $_SERVER['REQUEST_METHOD']): ?>
      <pre><code><?= json_encode($_POST, JSON_PRETTY_PRINT); ?></code></pre>
      <p><a href="">Back</a></p>
      <?php else: ?>
      <form method="post">
        <p>
          <input name="title" type="text" value="Title Here">
        </p>
        <p>
          <textarea name="content">Content here.</textarea>
        </p>
        <p>
          <button name="act" type="submit" value="1">Action 1</button>
          <button name="act" type="submit" value="2">Action 2</button>
          <button name="act" type="submit" value="3">Action 3</button>
          <button name="undo" type="reset" value="1">Reset</button>
        </p>
        <input name="test-hidden" type="hidden" value="Yo!">
      </form>
      <?php endif; ?>
    </main>
    <script src="../f3h.min.js"></script>
    <script>

    var f3h = new F3H,
        main = document.querySelector('main');

    f3h.on(200, function(response) {
        main.innerHTML = response.querySelector('main').innerHTML;
    });

    </script>
  </body>
</html>
