// Create a new scope each time the extension is activated.
(function() {

    // Setup full-window frame.
    const frame = document.createElement('iframe');
    frame.id = 'extmc-overlay'
    frame.style.position = 'fixed';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.border = 'none';
    frame.style.zIndex = Math.pow(2, 24).toString();

    // Get base template from this extension.
    const request = new XMLHttpRequest();
    request.open("GET", browser.extension.getURL("media-carousel.html"), false);
    request.send(null);

    // Replace script include with extension script URL.
    // Set response HTML as iframe src.
    var responseText = request.responseText;
    responseText = responseText.replace('media-carousel.js', browser.extension.getURL('media-carousel.js'))
    frame.setAttribute("src", "data:text/html," + encodeURIComponent(responseText));

    // Add to document and focus the frame.
    document.documentElement.appendChild(frame);
    frame.dispatchEvent(new Event('focus'));

    // Send the current document to the frame to extract media.
    frame.addEventListener('load', () => {
        let element = document.body ? document.body : document.documentElement;
        frame.contentWindow.postMessage(element.innerHTML, '*');
    });

    // TODO: Prevent scrolling the parent frame while carousel is visible.

    // Handle closing from within the frame.
    function handleMessage(event) {
        if (event.data === 'close-media-carousel') {
            document.documentElement.removeChild(frame);
        }
    }
    window.addEventListener('message', handleMessage, false);

})();
