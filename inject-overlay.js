(function() {
    const request = new XMLHttpRequest();
    request.open("GET", browser.extension.getURL("media-carousel.html"), false);
    request.send(null);

    var responseText = request.responseText;
    responseText = responseText.replace('media-carousel.js', browser.extension.getURL('media-carousel.js'))

    const frame = document.createElement('iframe');
    frame.id = 'extmc-overlay'
    frame.style.position = 'fixed';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.border = 'none';
    frame.style.zIndex = Math.pow(2, 24).toString();
    frame.setAttribute("src", "data:text/html," + encodeURIComponent(responseText));

    document.documentElement.appendChild(frame);
    frame.dispatchEvent(new Event('focus'));

    // TODO: Prevent scrolling the parent frame while carousel is visible.

    function handleMessage(event) {
        if (event.data === 'close-media-carousel') {
            document.documentElement.removeChild(frame);
        }
    }

    window.addEventListener('message', handleMessage, false);
})();
