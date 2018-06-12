import BaseTitle from "./title/base";
import EmbedTitle from "./title/embed-title";
import LinkTitle from "./title/link-title";

export default class Base implements BaseTitle {
    constructor(
        public element: HTMLLinkElement & HTMLIFrameElement & HTMLImageElement,
        public options
    ) {}

    get url() {
        return this.element.href;
    }

    get figure(): HTMLElement {
        return document.createElement("figure");
    }

    get node(): HTMLElement {
        return null;
    }

    get title() {
        return new EmbedTitle(this.element).title;
    }
}
