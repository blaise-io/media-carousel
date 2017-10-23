// TODO, maybe:
// Zoom indicator
// Preload functionality
// Make it slide
// Async plugins
// Imgur image page
// Imgur albums
// Nested slides [?]
// Video loop/mute options
// Minimal image size for inclusion [?]
// Preload slides


window.addEventListener('message', handleMessage, false);
document.getElementById('close').addEventListener('click', () => {
    window.parent.postMessage('close-media-carousel', '*');
});

const settings = {
    query: ['a[href]', 'img[src]', 'video'],
    videoAutoplay: false,
    videoMute: true,
    videoLoop: true,
    videoControls: true
}


class BasePlugin {

    constructor(element) {
        this.element = element;
    }

    get figure() {
        return document.createElement('figure');
    }

}


class LinkPlugin extends BasePlugin {

    get url() {
        return this.element.href;
    }

    get canHandle() {
        return this.element.tagName === 'A';
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
        return (
            super.canHandle &&
            Boolean(this.element.href.match(/\.(bmp|jpe?g|gif|png|svg)$/i))
        );
    }

    get img() {
        const img = document.createElement('img');
        img.src = this.element.href;
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
        video.autoplay = false;
        video.controls = true;
        video.muted = true;
        video.loop = true;
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
        video.poster = `https://thumbs.gfycat.com/${this.gfy}-mobile.jpg`;

        // Gfycat uses a limited set of hostnames for content.
        // TODO: Implement API to get video URL instead of trying all hosts.
        ['zippy', 'fat', 'giant'].forEach((bucket) => {
            let source = this.source;
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


const plugins = [ImageLink, GfyCat, ImgurGifv];  // Specialist plugins last.

function handleMessage(event) {
    const htmlStr = event.data;
    const htmlDoc = document.createElement('shadow');
    htmlDoc.innerHTML = htmlStr;

    const slides = [];
    const elements = htmlDoc.querySelectorAll(settings.query.join(','));

    function getSlideIndex(url) {
        for (let i = 0, m = slides.length; i < m; i++) {
            if (slides[i].url === url) {
                return i;
            }
        }
        return -1;
    }

    elements.forEach((element) => {
        plugins.forEach((PluginClass) => {
            const plugin = new PluginClass(element);
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


    var current = 0;
    const max = slides.length;

    const el = {
        prev: document.querySelector('#prev'),
        next: document.querySelector('#next'),
        slides: document.querySelector('#slides')
    };

    const dummy = document.createElement('figure');

    el.slides.appendChild(dummy);
    el.slides.appendChild(slides[current].node);
    el.slides.appendChild(slides[current + 1].node);

    // Next
    el.next.addEventListener('click', () => {
        el.slides.classList.add('animate')
        el.slides.classList.add('left');
        window.setTimeout(() => {
            current += 1;
            el.slides.classList.remove('animate');
            el.slides.classList.remove('left');
            console.log(el.slides.childNodes[0])
            el.slides.removeChild(el.slides.childNodes[0]);
            el.slides.appendChild(slides[current + 1].node);
        }, 305);
    });

}
