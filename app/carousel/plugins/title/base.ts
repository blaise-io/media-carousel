export default class BaseTitle {

    constructor(public element: HTMLElement) { }

    get title(): string {
        return this.element.title;
    }

}
