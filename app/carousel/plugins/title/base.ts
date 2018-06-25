export default class BaseTitle {

    constructor(public element: HTMLElement) { }

    public normalizeWhitespace(title: string = ""): string {
        return (title || "").trim().replace(/\s/g, " ");
    }

    get title(): string {
        return this.element.title;
    }

}
