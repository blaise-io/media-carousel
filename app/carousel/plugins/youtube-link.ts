import FrameEmbed from "./frame-embed";

export default class YouTubeLink extends FrameEmbed {
    get canHandle() {
        return Boolean(
            this.element.tagName === "A" &&
            this.options["include.videos"] &&
            this.url.match(this.regexp)
        );
    }

    get frame() {
        // https://developers.google.com/youtube/player_parameters#Parameters
        const options = {
            autoplay: Number(this.options["video.autoplay"]),
            controls: Number(this.options["video.controls"]),
            disablekb: 1,       // No keyboard (conflicts with carousel keys)
            iv_load_policy: 3,  // Disable video annotations
            loop: null,
            modestbranding: 1,  // No logo
            mute: Number(this.options["video.muted"]),
            playlist: null,
            rel: 0,             // No related videos
            showinfo: 0,        // No video title / uploader
        };
        if (this.options["video.loop"]) {
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
