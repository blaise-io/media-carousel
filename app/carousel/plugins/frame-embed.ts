import Base from "./base";
import LinkTitle from "./title/link-title";

export default class FrameEmbed extends Base {
    get frame() {
        const frame = document.createElement("iframe");
        frame.height = "100%";
        frame.width = "100%";
        frame.frameBorder = "0";
        frame.setAttribute("overflow", "scroll");
        return frame;
    }

    get title() {
        return new LinkTitle(this.element).title;
    }

    get node() {
        const figure = this.figure;
        figure.appendChild(this.frame);
        return figure;
    }

    public queryParams(obj: Record<string, string | number>) {
        return Object.entries(obj).map((entries) => {
            return entries.map(
                (entry) => encodeURIComponent(entry.toString())
            ).join("=");
        }).join("&");
    }
}
