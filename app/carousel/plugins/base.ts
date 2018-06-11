import EmbedTitle from "./title/embed-title";
import LinkTitle from "./title/link-title";

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

    get titleClass(): any {
        return EmbedTitle;
    }

    get title() {
        const TitleClass = this.titleClass;
        return new TitleClass(this.element).title;
    }
}
