import Carousel from "./carousel";
import SlideCollection from "./collection";

(() => {

    window.addEventListener("message", handleMessage);

    function handleMessage(event) {
        window.removeEventListener("message", handleMessage);
        initialize(JSON.parse(event.data));
    }

    function close() {
        const message = {mcext: {close: true}};
        parent.postMessage(JSON.stringify(message), "*");
    }

    function initialize(data) {
        const collection = new SlideCollection(data.html, data.options);
        const slides = collection.slides;

        if (slides.length) {
            const carousel = new Carousel(slides, data.options, close);
        } else {
            window.alert("No supported media found on this page.");
            close();
        }
    }

})();
