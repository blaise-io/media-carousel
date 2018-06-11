export default class LinkTitle {
    constructor(public element) {
    }

    get title() {
        return this.element.title || this.element.textContent;
    }
}
