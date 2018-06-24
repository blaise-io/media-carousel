import EmbedTitle from "./title/embed-title";

export default class Base {
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
