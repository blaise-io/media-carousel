import BaseTitle from "./base";

export default class LinkTitle extends BaseTitle {

    get title() {
        return this.normalizeWhitespace(
            this.element.title || this.element.textContent
        );
    }

}
