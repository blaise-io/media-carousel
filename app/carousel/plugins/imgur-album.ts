import FrameEmbed from "./frame-embed";

export default class ImgurAlbum extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === "A" &&
            this.options["include.images"] &&
            this.url.match(/imgur\.com\/a\/[\w\d]+/i)
        );
    }

    get frame() {
        const frame = super.frame;
        const params = this.queryParams({pub: "true", ref: this.url});
        frame.src = `https://imgur.com/a/${this.imgurid}/embed?${params}`;
        // Keep Imgur controls accessible:
        frame.width = "90%";
        // Allow scrolling because imgur sizes images
        // inside the frame in an unpredictable way.
        frame.setAttribute("overflow", "scroll");
        return frame;
    }

    get imgurid() {
        return this.url.match(/imgur\.com\/a\/([\w\d]+)/i)[1];
    }
}
