<?php

if ('POST' === $_SERVER['REQUEST_METHOD']) {
    $log = file_get_contents(__DIR__ . '/log');
    $v = trim(strip_tags($_POST['message']));
    if ("" !== $v) {
        $log .= '<b>[' . date('H:i:s') . ']</b> ' . $v . "\n";
    }
    file_put_contents(__DIR__ . '/log', $log);
    header('Location: .');
    exit;
}

?><!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <meta content="width=device-width" name="viewport">
    <title>Home</title>
  </head>
  <body>
    <main>
      <p><?= strtr(trim(file_get_contents(__DIR__ . '/log')), ["\n" => '<br>']); ?></p>
      <form action="" method="post">
        <p>
          <input autocomplete="off" autofocus name="message" type="text">
          <button type="submit">Save</button>
        </p>
      </form>
    </main>
    <script src="../f3h.min.js"></script>
    <script>

    var f3h = new F3H,
        main = document.querySelector('main');

    f3h.on(200, function(response) {
        document.title = response.title;
        main.innerHTML = response.querySelector('main').innerHTML;
    });

    </script>
  </body>
</html>
