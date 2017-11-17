/**
 * TODO, maybe:
 * Delay playback of videos until slide is visible
 * Preload more content
 * Async plugins
 * Use Imgur API for albums
 * Use Gfycat API for video URL
 * Embedded video plugin for <video> tags
 * Vimeo API to control volume so we can respect "muted" option
 * Handle hosts preventing hotlinking
 */


class EmbedTitle {
    constructor(element) {
        this.element = element;
    }

    get titleFromFigcaption() {
        const caption = (
            this.element.querySelector('figcaption') ||
            this.element.closest('figcaption')
        );
        return caption && caption.textContent;
    }

    get titleFromDataAttrib() {
        for (let i = 0, m = this.element.attributes.length; i < m; i++) {
            const attrib = this.element.attributes[i];
            const isTitleAttrib = attrib.name.match(/^data-.*(title|caption)/);
            const isUrl = attrib.value.match(/^https?:\/\//);
            if (isTitleAttrib && !isUrl) {
                return attrib.value;
            }
        }
    }

    get title() {
        return (
            this.element.title ||
            this.element.alt ||
            this.titleFromDataAttrib ||
            this.titleFromFigcaption
        );
    }
}


class LinkTitle {
    constructor(element) {
        this.title = element.title || element.textContent;
    }
}


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

    get titleClass() {
        return EmbedTitle;
    }

    get title() {
        const TitleClass = this.titleClass;
        return new TitleClass(this.element).title;
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
            this.options['include.images'] &&
            this.element.tagName === 'IMG' &&
            this.element.getAttribute('data-mcext-width') *
            this.element.getAttribute('data-mcext-height') > 250 * 250
        );
    }
}


class ImageLink extends Image {
    get titleClass() {
        return LinkTitle;
    }

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
            Boolean(this.url.match(/^https?:\/\/gfycat\.com\/[A-Z][\w]+/))
        );
    }

    get node() {
        const figure = this.figure;
        const video = this.video;
        video.poster = `https://thumbs.gfycat.com/${this.gfyId}-poster.jpg`;

        ['zippy', 'fat', 'giant'].forEach((bucket) => {
            const source = this.source;
            source.src = `https://${bucket}.gfycat.com/${this.gfyId}.mp4`;
            video.appendChild(source);
        });

        figure.appendChild(video);

        return figure;
    }

    get gfyId() {
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
        video.poster = `https://i.imgur.com/${this.imgurId}h.jpg`;

        const source = this.source;
        source.src = `https://i.imgur.com/${this.imgurId}.mp4`;
        video.appendChild(source);

        figure.appendChild(video);

        return figure;
    }

    get imgurId() {
        return this.element.href.match(/imgur\.com\/([\w\d]+).gifv/i)[1];
    }
}


class FrameEmbed extends Base {
    get frame() {
        const frame = document.createElement('iframe');
        frame.height = '100%';
        frame.width = '100%';
        frame.overflow = 'scroll';
        frame.frameBorder = '0';
        return frame;
    }

    get titleClass() {
        return LinkTitle;
    }

    get node() {
        const figure = this.figure;
        figure.appendChild(this.frame);
        return figure;
    }

    queryParams(obj) {
        return Object.entries(obj).map((entries) =>
            entries.map((entry) => encodeURIComponent(entry)).join('=')
        ).join('&');
    }
}


class ImgurAlbum extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.images'] &&
            this.url.match(/imgur\.com\/a\/[\w\d]+/i)
        );
    }

    get frame() {
        const frame = super.frame;
        const params = this.queryParams({pub: 'true', ref: this.url});
        frame.src = `https://imgur.com/a/${this.imgurid}/embed?${params}`;
        // Keep Imgur controls accessible:
        frame.width = '90%';
        // Allow scrolling because imgur sizes images
        // inside the frame in an unpredictable way.
        frame.overflow = 'scroll';
        return frame;
    }

    get imgurid() {
        return this.url.match(/imgur\.com\/a\/([\w\d]+)/i)[1];
    }
}


class YouTubeLink extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.videos'] &&
            this.url.match(this.regexp)
        );
    }

    get frame() {
        // https://developers.google.com/youtube/player_parameters#Parameters
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
            options.playlist = this.youTubeId;
        }
        const params = this.queryParams(options);
        const frame = super.frame;
        frame.src = `https://www.youtube.com/embed/${this.youTubeId}?${params}`;
        return frame;
    }

    get regexp() {
        return /:\/\/(?:www\.)?youtu(?:be\.com|\.be).*(?:\/|v=)([\w]{11})/i;
    }

    get youTubeId() {
        return this.url.match(this.regexp)[1];
    }
}


class VimeoLink extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.videos'] &&
            this.url.match(this.regexp)
        );
    }

    get frame() {
        const frame = super.frame;
        const options = {
            autopause: 0,
            byline: 0,
            title: 0,
            autoplay: Number(this.options['video.autoplay']),
            loop: Number(this.options['video.loop']),
            // Controls and sound cannot be controlled.
        };
        const params = this.queryParams(options);
        frame.src = `https://player.vimeo.com/video/${this.vimeoId}?${params}`;
        return frame;
    }

    get regexp() {
        return /https:\/\/vimeo\.com\/([\d]{9})/i;
    }

    get vimeoId() {
        return this.url.match(this.regexp)[1];
    }
}


class StreamableLink extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === 'A' &&
            this.options['include.videos'] &&
            this.url.match(this.regexp)
        );
    }

    get frame() {
        const frame = super.frame;
        const options = {
            autopause: 0,
            byline: 0,
            title: 0,
            autoplay: Number(this.options['video.autoplay']),
            loop: Number(this.options['video.loop']),
            controls: Number(this.options['video.controls']),
        };
        const params = this.queryParams(options);
        frame.src = `https://streamable.com/s/${this.streamableId}?${params}`;
        return frame;
    }

    get regexp() {
        return /https:\/\/streamable\.com\/([^/]+)/i;
    }

    get streamableId() {
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
    VimeoLink,
    StreamableLink,
];
