import Base from "./base";
import LinkTitle from "./title/link-title";

export default class VideoLink extends Base {
    get url() {
        return this.element.href;
    }

    get canHandle() {
        return Boolean(
            this.options["include.videos"] &&
            this.element.tagName === "A" &&
            this.url
        );
    }

    get video() {
        const video = document.createElement("video");
        video.title = this.title;
        video.preload = "auto";
        // TODO: support onenter, onleave to handle autoplay.
        video.autoplay = this.options["video.autoplay"];
        video.controls = this.options["video.controls"];
        video.muted = this.options["video.muted"];
        video.loop = this.options["video.loop"];
        return video;
    }

    get source() {
        const source = document.createElement("source");
        source.type = "video/mp4";
        return source;
    }

    get title() {
        return new LinkTitle(this.element).title;
    }
}
