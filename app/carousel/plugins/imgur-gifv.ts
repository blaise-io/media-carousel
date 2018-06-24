import VideoLink from "./video-link";

export default class ImgurGifv extends VideoLink {
    get canHandle() {
        return (
            super.canHandle &&
            this.options["include.videos"] &&
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
