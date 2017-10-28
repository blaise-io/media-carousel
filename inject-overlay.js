(function() {

    // Executed in host window context.
    // Create new scope every time toolbar button is clicked.

    const defaultOptionsPromise = new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', browser.extension.getURL('options/defaults.json'));
        xhr.overrideMimeType('application/json');
        xhr.send(null);
        xhr.onload = () => {
            resolve(JSON.parse(xhr.response));
        };
    });

    const savedOptionsPromise = browser.storage.sync.get('options');

    const overlayPromise = new Promise((resolve) => {
        const frame = document.createElement('iframe');
        frame.style.position = 'fixed';
        frame.style.width = '100vw';
        frame.style.height = '100vh';
        frame.style.left = '0';
        frame.style.top = '0';
        frame.style.border = 'none';
        frame.style.zIndex = Math.pow(2, 24).toString();
        frame.src = browser.extension.getURL('carousel/carousel.html');
        frame.addEventListener('load', () => {
            resolve(frame);
        });
        document.documentElement.appendChild(frame);
    });

    const promises = [
        defaultOptionsPromise,
        savedOptionsPromise,
        overlayPromise
    ];

    Promise.all(promises).then((result) => {
        const options = Object.assign(result[0], result[1].options);
        const frame = result[2];

        chrome.runtime.sendMessage({action: 'open'});
        addMessageListener(frame);
        setBlur(frame, true);

        frame.contentWindow.postMessage(JSON.stringify({
            html: getPatchedHTML(),
            options: options
        }), '*');
    });

    function addMessageListener(frame) {
        window.addEventListener('message', (event) => {
            let data;
            try {
                data = JSON.parse(event.data)['mcext'];
            } catch (e) {
                // Not our message.
            }

            if (!data) {
                return;
            }

            if (data.close) {
                setBlur(frame, false);
                document.documentElement.removeChild(frame);
                // Notify background.js, which handles the toolbar button.
                chrome.runtime.sendMessage({action: 'close'});
            }
        });
    }

    function getPatchedHTML() {
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

        return element.innerHTML;
    }

    function setBlur(frame, enable) {
        frame.parentNode.childNodes.forEach((element) => {
            if (element && element !== frame && element.offsetWidth) {
                element.style.filter = enable ? 'blur(1px)' : '';
            }
        });
    }

})();
