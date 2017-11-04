class Base {

    constructor(element, options) {
        this.element = element;
        this.options = options;
    }

    get url() {
        return this.element.href;
    }

    get figure() {
        return document.createElement('figure');
    }

    params(obj) {
        return Object.entries(obj).map(entries =>
            entries.map(entry => encodeURIComponent(entry)).join('=')
        ).join('&');
    }
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
            this.options['include.images.embed'] &&
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
            this.options['include.images'] &&
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
        return Boolean(
            this.options['include.videos'] &&
            this.element.tagName === 'A' &&
            this.url
        );
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
        // TODO: Implement API to get video URL instead of adding all hosts.
        ['zippy', 'fat', 'giant'].forEach((bucket) => {
            const source = this.source;
            source.src = `https://${bucket}.gfycat.com/${this.gfy}.mp4`;
            video.appendChild(source);
        });

        figure.appendChild(video);

        return figure;
    }

    get gfy() {
        return this.element.href.split('/').reverse()[0].split(/[^\w]/)[0];
    }
}


class ImgurGifv extends VideoLink {

    get canHandle() {
        return (
            super.canHandle &&
            this.options['include.videos'] &&
            Boolean(this.url.match(/imgur\.com\/[\w\d]+.gifv/))
        );
    }

    get node() {
        const figure = this.figure;

        const video = this.video;
        video.poster = `https://i.imgur.com/${this.imgurid}h.jpg`;

        const source = this.source;
        source.src = `https://i.imgur.com/${this.imgurid}.mp4`;
        video.appendChild(source);

        figure.appendChild(video);

        return figure;
    }

    get imgurid() {
        return this.element.href.match(/imgur\.com\/([\w\d]+).gifv/i)[1];
    }
}


class ImgurAlbum extends Base {

    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.images'] &&
            this.url.match(/imgur\.com\/a\/[\w\d]+/i)
        );
    }

    get title() {
        return this.element.title || this.element.textContent;
    }

    get node() {
        const frame = document.createElement('iframe');
        const params = this.params({pub: 'true', ref: this.url});
        frame.src = `https://imgur.com/a/${this.imgurid}/embed?${params}`;
        frame.height = Math.min(window.innerHeight * 0.9, 768);
        frame.width = Math.min(window.innerWidth * 0.8, 1024);
        frame.overflow = 'scroll';

        const figure = this.figure;
        figure.appendChild(frame);

        return figure;
    }

    get imgurid() {
        return this.url.match(/imgur\.com\/a\/([\w\d]+)/i)[1];
    }
}


class YouTubeLink extends Base {

    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.videos'] &&
            this.url.match(this.regexp)
        );
    }

    get title() {
        return this.element.title || this.element.textContent;
    }

    get node() {
        // https://developers.google.com/youtube/player_parameters#Parameters
        const frame = document.createElement('iframe');
        const options = {
            autoplay: Number(this.options['video.autoplay']),
            controls: Number(this.options['video.controls']),
            mute: Number(this.options['video.muted']),
            modestbranding: 1,  // No logo
            disablekb: 1,       // No keyboard (conflicts with carousel keys)
            rel: 0,             // No related videos
            showinfo: 0,        // No video title / uploader
            iv_load_policy: 3,  // Disable video annotations
        };
        if (this.options['video.loop']) {
            options.loop = 1;
            options.playlist = this.ytid;
        }
        const params = this.params(options);
        frame.src = `https://www.youtube.com/embed/${this.ytid}?${params}`;
        frame.height = '100%';
        frame.width = '100%';

        const figure = this.figure;
        figure.appendChild(frame);

        return figure;
    }

    get regexp() {
        return /:\/\/(?:www\.)?youtu(?:be\.com|\.be).*(?:\/|v=)([\w]{11})/i;
    }

    get ytid() {
        return this.url.match(this.regexp)[1];
    }
}


window.PLUGINS = [
    ImageEmbed,
    ImageLink,
    GfyCat,
    ImgurGifv,
    ImgurAlbum,
    YouTubeLink,
];
