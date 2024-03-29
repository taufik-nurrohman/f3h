<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width" name="viewport">
    <meta content="Progressively enhanced JavaScript AJAX features for your existing web pages." name="description">
    <title>Home</title>
  </head>
  <body>
    <main><?php if ('POST' === $_SERVER['REQUEST_METHOD']): ?>
      <pre><code><?= json_encode($_POST, JSON_PRETTY_PRINT); ?></code></pre>
      <p><a href="">Back</a></p><?php else: ?><form method="post">
        <p><input name="text" type="text" value="Title Here"></p>
        <p><textarea name="textarea">Content here.</textarea></p>
        <p><label><input name="radio" type="radio" value="1"> Option 1</label><label><input name="radio" type="radio" value="2"> Option 2</label><label><input name="radio" type="radio" value="3"> Option 3</label></p>
        <p><label><input name="checkbox" type="checkbox" value="1"> Toggle 1</label></p>
        <p><select name="select">
            <option>Value 1</option>
            <option value="2">Value 2</option>
          </select></p>
        <p><button name="act" type="submit" value="1">Action 1</button> <button name="act" type="submit" value="2">Action 2</button> <button name="act" type="submit" value="3">Action 3</button> <button name="undo" type="reset" value="1">Reset</button></p><input name="hidden" type="hidden" value="Yo!"><input name="foo[bar]" type="hidden" value="Test Nested Key">
      </form><?php endif; ?>
    </main>
    <script src="../../index.min.js"></script>
    <script>
      let f3h = new F3H,
          main = document.querySelector('main');
      f3h.on(200, response => {
          main.innerHTML = response.querySelector('main').innerHTML;
      });
    </script>
  </body>
</html>