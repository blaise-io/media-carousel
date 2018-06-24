import VideoLink from "./video-link";

export default class GfyCat extends VideoLink {
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

        ["zippy", "fat", "giant"].forEach((bucket) => {
            const source = this.source;
            source.src = `https://${bucket}.gfycat.com/${this.gfyId}.mp4`;
            video.appendChild(source);
        });

        figure.appendChild(video);

        return figure;
    }

    get gfyId() {
        return this.element.href.split("/").reverse()[0].split(/[^\w]/)[0];
    }
}
