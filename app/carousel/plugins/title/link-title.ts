import BaseTitle from "./base";

export default class LinkTitle extends BaseTitle {

    get imgalt() {
        const img = this.element.querySelector("img");
        const alt = img && img.alt.trim();
        return alt || null;
    }

    get textcontent() {
        const content = this.element.textContent.replace(/[\.…]+$/, "");
        const href = (this.element as HTMLAnchorElement).href;
        return (-1 === href.indexOf(content)) ? this.element.textContent : null;
    }

    get title() {
        return this.normalizeWhitespace(
            this.element.title || this.imgalt || this.textcontent
        );
    }

}
