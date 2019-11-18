import VideoLink from "./video-link";

export default class GfyCat extends VideoLink {
    get canHandle() {
        return (
            super.canHandle &&
            Boolean(this.url.match(/^https?:\/\/gfycat\.com\/[\w]+/))
        );
    }

    get node() {
        const figure = this.figure;
        const video = this.video;

        fetch(`https://api.gfycat.com/v1/gfycats/${this.gfyId}`).then((r) => {
            r.json().then((json) => {
                video.poster = json.gfyItem.posterUrl;
                [json.gfyItem.webmUrl, json.gfyItem.mp4Url].forEach((src) => {
                    const source = this.source;
                    source.src = src;
                    video.appendChild(source);
                });
                figure.appendChild(video);
            });
        });

        return figure;
    }

    get gfyId() {
        return this.element.href.split("/").reverse()[0].split(/[^\w]/)[0];
    }
}
