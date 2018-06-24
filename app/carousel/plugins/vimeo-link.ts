import FrameEmbed from "./frame-embed";

export default class VimeoLink extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === "A" &&
            this.options["include.videos"] &&
            this.url.match(this.regexp)
        );
    }

    get frame() {
        const frame = super.frame;
        const options = {
            autopause: 0,
            autoplay: Number(this.options["video.autoplay"]),
            byline: 0,
            loop: Number(this.options["video.loop"]),
            title: 0,
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
