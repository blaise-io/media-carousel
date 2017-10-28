/**
 * TODO, MVP:
 * Imgur albums using imgur's embed code
 * YouTube link plugin
 * Handle include.* options
 * Test if options sync works across devices
 * Extract carousel stuff from handleMessage(), create Carousel class
 *
 * TODO, maybe:
 * Embedded video plugin for <video> tags
 * Replace no media alert with HTML
 * Steal focus from host page
 * No media message
 * Zoom indicator and click to real-size / scroll
 * Preload multiple slides
 * Async plugins
 * Imgur albums using API
 * Vimeo link plugin
 * Nested slides
 * Minimal media size for inclusion
 * Hotlink workaround (e.g. Twitter)
 * Prevent parent scroll
 */

window.addEventListener('message', handleMessage, false);

class Base {

    constructor(element, options) {
        this.element = element;
        this.options = options;
    }

    get figure() {
        return document.createElement('figure');
    }

    // get figcaption() {
    //     const figcaption = document.createElement('figcaption');
    //     figcaption.classList.add('text-shadow');
    //     figcaption.innerHTML = `<a href="${this.url}">${this.title}</a>`;
    //     return figcaption;
    // }

}


class Image extends Base {

    get img() {
        const img = document.createElement('img');
        img.src = this.url;
        img.title = this.title;
        return img;
    }

    get node() {
        const figure = this.figure;
        figure.appendChild(this.img);
        return figure;
    }

    get imgExtRegexp() {
        return /\.(bmp|jpeg|jpg|gif|png|svg)$/i;
    }

}


class ImageEmbed extends Image {

    get url() {
        return this.element.src;
    }

    get canHandle() {
        // Exclude thumbnails and other tiny images.
        // http://gph.is/1efSlt9
        return Boolean(
            this.element.tagName === 'IMG' &&
            this.element.getAttribute('data-mcext-width') *
            this.element.getAttribute('data-mcext-height') > 250 * 250
        );
    }

    get title() {
        return this.element.title || this.element.alt;
    }

}


class ImageLink extends Image {

    get url() {
        return this.element.href;
    }

    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.url.match(this.imgExtRegexp)
        );
    }

    get title() {
        return this.element.title || this.element.textContent;
    }

}


class VideoLink extends Base {

    get url() {
        return this.element.href;
    }

    get canHandle() {
        return Boolean(this.element.tagName === 'A' && this.url);
    }

    get video() {
        const video = document.createElement('video');
        video.title = this.title;
        video.preload = 'auto';
        // TODO: support onenter, onleave to handle autoplay.
        video.autoplay = this.options['video.autoplay'];
        video.controls = this.options['video.controls'];
        video.muted = this.options['video.muted'];
        video.loop = this.options['video.loop'];
        return video;
    }

    get source() {
        const source = document.createElement('source');
        source.type = 'video/mp4';
        return source;
    }

    get title() {
        return this.element.title || this.element.textContent;
    }

}


class GfyCat extends VideoLink {

    get canHandle() {
        return (
            super.canHandle &&
            Boolean(this.url.match(/^https?:\/\/gfycat\.com\/[\w]+/i))
        );
    }

    get node() {
        const figure = this.figure;
        const video = this.video;
        video.poster = `https://thumbs.gfycat.com/${this.gfy}-poster.jpg`;

        // Gfycat uses a limited set of hostnames for content.
        // TODO: Implement API to get video URL instead of trying all hosts.
        ['zippy', 'fat', 'giant'].forEach((bucket) => {
            const source = this.source;
            source.src = `https://${bucket}.gfycat.com/${this.gfy}.mp4`;
            video.appendChild(source);
        });

        figure.appendChild(video);
        // figure.appendChild(this.figcaption);

        return figure;
    }

    get gfy() {
        return this.element.href.split('/').reverse()[0];
    }
}


class ImgurGifv extends VideoLink {

    get canHandle() {
        return (
            super.canHandle &&
            Boolean(this.element.href.match(/imgur\.com\/[\w\d]+.gifv/))
        );
    }

    get node() {
        const figure = document.createElement('figure');

        const video = this.video;
        video.poster = `https://i.imgur.com/${this.imgurid}h.jpg`;

        const source = this.source;
        source.src = `https://i.imgur.com/${this.imgurid}.mp4`;
        video.appendChild(source);

        figure.appendChild(video);
        // figure.appendChild(this.figcaption);

        return figure;
    }

    get imgurid() {
        return this.element.href.match(/imgur\.com\/([\w\d]+).gifv/i)[1];
    }
}


function handleMessage(event) {
    // Specialist plugins last.
    const PLUGINS = [ImageEmbed, ImageLink, GfyCat, ImgurGifv];
    const data = JSON.parse(event.data);
    const htmlDoc = document.createElement('shadow');
    htmlDoc.innerHTML = data.html;

    const slides = [];
    const query = ['a[href]', 'img[src]', 'video', 'iframe'];
    const elements = htmlDoc.querySelectorAll(query.join(','));

    function getSlideIndex(url) {
        for (let i = 0, m = slides.length; i < m; i++) {
            if (slides[i].url === url) {
                return i;
            }
        }
        return -1;
    }

    elements.forEach((element) => {
        PLUGINS.forEach((PluginClass) => {
            const plugin = new PluginClass(element, data.options);
            if (plugin.canHandle) {
                const existingSlideIndex = getSlideIndex(plugin.url);
                if (existingSlideIndex !== -1 && plugin.title) {
                    // Overwrite same media without title.
                    slides[existingSlideIndex] = plugin;
                } else {
                    slides.push(plugin);
                }
            }
        });
    });

    if (!slides.length) {
        window.alert('No supported media found on this page.');
        close();
        return;
    }

    let current = 0;
    const max = slides.length;

    const el = {
        prev: document.querySelector('#prev'),
        next: document.querySelector('#next'),
        slides: document.querySelector('#slides'),
        title: document.querySelector('#title'),
        current: document.querySelector('#current'),
        max: document.querySelector('#max')
    };

    el.prev.addEventListener('click', prev);
    el.next.addEventListener('click', next);

    el.slides.appendChild(getSlide(current - 1));
    el.slides.appendChild(getSlide(current));
    el.slides.appendChild(getSlide(current + 1));

    postHtmlUpdate();

    // Preload.
    // slides.forEach((slide) => {
    //     var link = document.createElement('link');
    //     link.rel = 'preload';
    //     link.href = slide.url;
    //     document.head.appendChild(link);
    // });

    let animating = false;

    document.addEventListener('keyup', (event) => {
        switch (event.which) {
            case 27: close(); break; // Esc
            case 37: prev();  break; // ◄
            case 39: next();  break; // ►
        }
    });

    function getSlide(index) {
        return slides[index] ?
            slides[index].node :
            document.createElement('figure'); // Dummy
    }

    function prev() {
        if (animating || current === 0) {
            return;
        }
        animating = true;
        el.slides.classList.add('animate', 'right');
        window.setTimeout(() => {
            current -= 1;
            preHtmlUpdate();
            el.slides.removeChild(el.slides.childNodes[2]);
            el.slides.insertBefore(
                getSlide(current - 1),
                el.slides.childNodes[0]
            );
            postHtmlUpdate();
        }, 205);
    }

    function next() {
        if (animating || current + 1 === max) {
            return;
        }
        animating = true;
        el.slides.classList.add('animate', 'left');
        window.setTimeout(() => {
            current += 1;

            preHtmlUpdate();

            el.slides.appendChild(getSlide(current + 1));
            el.slides.removeChild(el.slides.childNodes[0]);

            postHtmlUpdate();

        }, 205);
    }

    function preHtmlUpdate() {
        // Remove animate class first or it will animate left/right removal.
        el.slides.classList.remove('animate');
        el.slides.classList.remove('left', 'right');
        animating = false;
    }

    function postHtmlUpdate() {
        el.current.textContent = String(current + 1);
        el.max.textContent = String(max);
        // innerHTML because string may contain html entities.
        el.title.innerHTML = slides[current].title;

        el.prev.classList.toggle('disabled', current === 0);
        el.next.classList.toggle('disabled', current + 1 === max);
    }

}

function close() {
    postMessage({close: true});
}

function postMessage(data) {
    parent.postMessage(JSON.stringify({mcext: data}), '*');
}
