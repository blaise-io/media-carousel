(function() {

    // Setup full-window frame.
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.border = 'none';
    frame.style.zIndex = Math.pow(2, 24).toString();
    frame.src = browser.extension.getURL('media-carousel/media-carousel.html');

    const request = new XMLHttpRequest();
    const defaults = browser.extension.getURL('options/defaults.json');
    request.open('GET', defaults, false);
    request.send(null);

    const options = JSON.parse(request.responseText);
    browser.storage.sync.get('options').then((result) => {
        Object.assign(options, result.options);
    });

    // TODO: Prevent a race condition with async fetching options from storage.
    // TODO: Prevent scrolling the parent frame while carousel is visible.
    // Send the current document to the frame to extract media.
    frame.addEventListener('load', () => {
        const element = document.body || document.documentElement;

        // Make img.src absolute and augment tag with image size.
        element.querySelectorAll('img[src]').forEach((img) => {
            img.setAttribute('src', img.src);
            img.setAttribute('data-mcext-width', img.offsetWidth);
            img.setAttribute('data-mcext-height', img.offsetHeight);
        });

        // Make a.href absolute.
        element.querySelectorAll('a[href]').forEach((a) => {
            a.setAttribute('href', a.href);
        });

        const message = JSON.stringify({
            html: element.innerHTML,
            options: options
        });
        frame.contentWindow.postMessage(message, '*');
    });

    window.addEventListener('message', (event) => {
        if (event.data === 'close-media-carousel') {
            document.documentElement.removeChild(frame);
            // Notify background.js, which handles the toolbar button.
            chrome.runtime.sendMessage({action: 'close'});
        }
    });

    document.documentElement.appendChild(frame);
    chrome.runtime.sendMessage({action: 'open'});

})();
