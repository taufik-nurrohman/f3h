<?php

if ('POST' === $_SERVER['REQUEST_METHOD']) {
    $log = file_get_contents(__DIR__ . '/log');
    $v = trim(strip_tags($_POST['message']));
    if ("" !== $v) {
        $log .= '[' . date('H:i:s') . '] ' . strtr($v, [
            '[' => '&#x5B;',
            ']' => '&#x5D;'
        ]) . "\n";
    }
    file_put_contents(__DIR__ . '/log', $log);
    header('Location: ./index.php');
    exit;
}

?>
<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width" name="viewport">
    <meta content="Progressively enhanced JavaScript AJAX features for your existing web pages." name="description">
    <title>Home</title>
  </head>
  <body>
    <main>
      <h1>Notes</h1><?php if ($content = file_get_contents(__DIR__ . '/log')): ?><p><?= strtr(trim('<b>' . $content), [
    "\n[" => '<br><b>[',
     '] ' => ']</b> '
]); ?></p><?php endif; ?><form method="post">
        <p><input autocomplete="off" autofocus name="message" type="text"> <button type="submit">Send</button></p>
      </form>
    </main>
    <script src="../../index.min.js"></script>
    <script>
      let f3h = new F3H,
          main = document.querySelector('main');
      f3h.on(200, response => {
          document.title = response.title;
          main.innerHTML = response.querySelector('main').innerHTML;
      });
    </script>
  </body>
</html>