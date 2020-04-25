var currentScript = document.currentScript,
    embedMarkup = document.createElement('p');

embedMarkup.style.cssText = 'display:block;padding:.5em 1em;border:1px solid;background:#ff0;color:#000;';
embedMarkup.innerHTML = 'Test embed view. This paragraph must appear right before this <code>&lt;script&gt;</code> element!';

currentScript.parentNode.insertBefore(embedMarkup, currentScript);

alert('Yo');
