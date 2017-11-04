(function() {
    window.addEventListener('message', handleMessage);

    function handleMessage(event) {
        window.removeEventListener('message', handleMessage);
        initialize(JSON.parse(event.data));
    }

    function close() {
        const message = {mcext: {close: true}};
        parent.postMessage(JSON.stringify(message), '*');
    }

    function initialize(data) {
        const collection = new window.SlideCollection(data.html, data.options);
        const slides = collection.slides;

        if (slides.length) {
            new window.Carousel(slides, close);
        } else {
            window.alert('No supported media found on this page.');
            close();
        }
    }

})();