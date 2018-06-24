import defaultOptions from "./options/defaults";

if (process.env.BROWSER !== "firefox") {
    window.browser = require("webextension-polyfill");  // tslint:disable-line
}

(() => {

    const savedOptionsPromise = browser.storage.sync.get("options");

    const overlayPromise = new Promise((resolve) => {
        const frame = document.createElement("iframe");
        frame.style.position = "fixed";
        frame.style.width = "100vw";
        frame.style.height = "100vh";
        frame.style.left = "0";
        frame.style.top = "0";
        frame.style.border = "none";
        frame.style.zIndex = Math.pow(2, 24).toString();
        frame.src = browser.extension.getURL("/carousel.html");
        frame.addEventListener("load", () => {
            resolve(frame);
        });
        document.documentElement.appendChild(frame);
    });

    const promises = [
        savedOptionsPromise,
        overlayPromise,
    ];

    Promise.all(promises).then((result) => {
        const options = {...defaultOptions, ...result[0].options};
        const frame: HTMLIFrameElement = result[1];

        browser.runtime.sendMessage({action: "open"});
        addMessageListener(frame);
        toggleHostStyle(frame, true);

        frame.contentWindow.focus();
        frame.contentWindow.postMessage(JSON.stringify({
            html: getPatchedHTML(),
            options,
        }), "*");
    });

    function addMessageListener(loadedFrame) {
        window.addEventListener("message", (event) => {
            let data;
            try {
                data = JSON.parse(event.data).mcext;
            } catch (e) {
                // Not our message.
            }

            if (!data) {
                return;
            }

            if (data.close) {
                toggleHostStyle(loadedFrame, false);
                document.documentElement.removeChild(loadedFrame);
                // Notify background.js, which handles the toolbar button.
                browser.runtime.sendMessage({action: "close"});
            }
        });
    }

    function getPatchedHTML() {
        const element = document.body || document.documentElement;

        // Make img.src absolute and augment tag with image size.
        const images = Array.from(element.querySelectorAll("img[src]"));
        images.forEach((img: HTMLImageElement) => {
            img.setAttribute("src", img.src);
            img.setAttribute("data-mcext-width", img.offsetWidth.toString());
            img.setAttribute("data-mcext-height", img.offsetHeight.toString());
        });

        // Make a.href absolute.
        const links = Array.from(element.querySelectorAll("a[href]"));
        links.forEach((a: HTMLLinkElement) => {
            a.setAttribute("href", a.href);
        });

        return element.innerHTML;
    }

    function toggleHostStyle(frame: HTMLIFrameElement, enable: boolean) {
        const body = frame.parentNode as HTMLElement;
        body.style.overflow = enable ? "hidden" : "";
        Array.from(body.childNodes).forEach((element: HTMLElement) => {
            if (element && element !== frame && element.offsetWidth) {
                element.style.filter = enable ? "blur(1px)" : "";
            }
        });
    }

})();
