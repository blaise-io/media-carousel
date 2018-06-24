export default class BaseTitle {

    constructor(public element: HTMLElement) { }

    public normalizeWhitespace(title: string = ""): string {
        return title.trim().replace(/[\s\t\r\n]+/, "\s");
    }

    get title(): string {
        return this.element.title;
    }

}
