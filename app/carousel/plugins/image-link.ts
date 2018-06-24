import ImageBase from "./image";
import LinkTitle from "./title/link-title";

export default class ImageLink extends ImageBase {

    get title() {
        return new LinkTitle(this.element).title;
    }

    get url() {
        return this.element.href;
    }

    get canHandle() {
        return Boolean(
            this.options["include.images"] &&
            this.element.tagName === "A" &&
            this.url.match(this.imgExtRegexp)
        );
    }
}
