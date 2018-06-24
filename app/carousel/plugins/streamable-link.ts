import FrameEmbed from "./frame-embed";

export default class StreamableLink extends FrameEmbed {
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
            controls: Number(this.options["video.controls"]),
            loop: Number(this.options["video.loop"]),
            title: 0,
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
