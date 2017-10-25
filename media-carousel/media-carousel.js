/**
 * TODO, MVP:
 * Embedded images plugin
 * Embedded video plugin
 * YouTube plugin
 * Vimeo plugin
 * Handle no media
 * Handle first/last
 * Style title
 * Show index
 * Handle include.* options
 * Test options sync
 *
 * TODO, maybe:
 * Zoom indicator
 * Preload functionality
 * Async plugins
 * Imgur image page
 * Imgur albums
 * Nested slides [?]
 * Video loop/mute options
 * Minimal image size for inclusion [?]
 * Hotlink workaround [?]
 */

window.addEventListener('message', handleMessage, false);
document.getElementById('close').addEventListener('click', () => {
    window.parent.postMessage('close-media-carousel', '*');
});


class BasePlugin {

    constructor(element, options) {
        this.element = element;
        this.options = options;
    }

    get figure() {
        return document.createElement('figure');
    }

}


class LinkPlugin extends BasePlugin {

    get url() {
        let url = this.element.href;
        // Protocol-relative doesn't work in a data url.
        // TODO: Send protocol of parent instead of guessing https.
        if (url.indexOf('//') === 0) {
            url = `https:${url}`;
        }
        return url;
    }

    get canHandle() {
        return Boolean(this.element.tagName === 'A' && this.element.href);
    }

    get title() {
        return this.element.title || this.element.textContent;
    }

    get figcaption() {
        const figcaption = document.createElement('figcaption');
        figcaption.innerHTML = `<a href="${this.url}">${this.title}</a>`;
        return figcaption;
    }

}


class ImageLink extends LinkPlugin {

    get canHandle() {
        return Boolean(
            super.canHandle &&
            this.url.match(/\.(bmp|jpeg|jpg|gif|png|svg)$/i)
        );
    }

    get img() {
        const img = document.createElement('img');
        img.src = this.url;
        img.title = this.title;
        return img;
    }

    get node() {
        const figure = this.figure;
        figure.appendChild(this.img);
        figure.appendChild(this.figcaption);
        return figure;
    }

}


class VideoLink extends LinkPlugin {

    get video() {
        const video = document.createElement('video');
        video.title = this.title;
        video.preload = 'auto';
        // TODO: support onenter, onleave to handle autoplay.
        video.autoplay = this.options['video.autoplay'];
        video.controls = true;
        video.muted = this.options['video.mute'];
        video.loop = this.options['video.loop'];
        return video;
    }

    get source() {
        const source = document.createElement('source');
        source.type = 'video/mp4';
        return source;
    }

}


class GfyCat extends VideoLink {

    get canHandle() {
        return (
            super.canHandle &&
            Boolean(this.element.href.match(/^https?:\/\/gfycat\.com/))
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
        figure.appendChild(this.figcaption);

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
        figure.appendChild(this.figcaption);

        return figure;
    }

    get imgurid() {
        return this.element.href.match(/imgur\.com\/([\w\d]+).gifv/i)[1];
    }
}


function handleMessage(event) {
    const PLUGINS = [ImageLink, GfyCat, ImgurGifv];  // Specialist plugins last.
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
            const plugin = new PluginClass(data.options, element);
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

    let current = 0;
    const max = slides.length;

    const el = {
        prev: document.querySelector('#prev'),
        next: document.querySelector('#next'),
        slides: document.querySelector('#slides')
    };

    el.slides.appendChild(getSlide(current - 1));
    el.slides.appendChild(getSlide(current));
    el.slides.appendChild(getSlide(current + 1));

    el.prev.addEventListener('click', prev);
    el.next.addEventListener('click', next);

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
            // TODO: Escape button = exit.
            case 37: prev(); break;
            case 39: next(); break;
        }
    }, false);

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
            el.slides.classList.remove('animate');
            el.slides.classList.remove('right');
            el.slides.insertBefore(
                getSlide(current - 1),
                el.slides.childNodes[0]
            );
            el.slides.removeChild(el.slides.childNodes[2]);
            animating = false;
        }, 305);
    }

    function next() {
        if (animating || current + 1 === max) {
            return;
        }
        animating = true;
        el.slides.classList.add('animate', 'left');
        window.setTimeout(() => {
            current += 1;
            el.slides.classList.remove('animate');
            el.slides.classList.remove('left');
            el.slides.appendChild(getSlide(current + 1));
            el.slides.removeChild(el.slides.childNodes[0]);
            animating = false;
        }, 305);
    }

}