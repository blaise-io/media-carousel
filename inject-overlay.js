// TODO: Send message to background.js when the overlay is closed.
// Create a new scope each time the extension is activated.
(function () {

    // Setup full-window frame.
    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.width = '100vw';
    frame.style.height = '100vh';
    frame.style.left = '0';
    frame.style.top = '0';
    frame.style.border = 'none';
    frame.style.zIndex = Math.pow(2, 24).toString();
    frame.src = browser.extension.getURL("media-carousel.html");

    // TODO: Prevent scrolling the parent frame while carousel is visible.
    // Send the current document to the frame to extract media.
    frame.addEventListener('load', (event) => {
        const element = document.body ? document.body : document.documentElement;
        frame.contentWindow.postMessage(element.innerHTML, '*');
        frame.contentWindow.focus(); // TODO: Keys aren't captured by frame; focus differently
    });

    window.addEventListener('message', (event) => {
        if (event.data === 'close-media-carousel') {
            document.documentElement.removeChild(frame);
        }
    });

    document.documentElement.appendChild(frame);

})();
