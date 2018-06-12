import BaseTitle from "./base";

export default class EmbedTitle extends BaseTitle {

    get title() {
        return (
            this.element.title ||
            this.element.getAttribute("alt") ||
            this.titleFromDataAttrib ||
            this.titleFromFigcaption
        );
    }

    get titleFromFigcaption(): string {
        const caption = (
            this.element.querySelector("figcaption") ||
            this.element.closest("figcaption")
        );
        return caption && caption.textContent;
    }

    get titleFromDataAttrib(): string {
        for (let i = 0, m = this.element.attributes.length; i < m; i++) {
            const attrib = this.element.attributes[i];
            const isTitleAttrib = attrib.name.match(/^data-.*(title|caption)/);
            const isUrl = attrib.value.match(/^https?:\/\//);
            if (isTitleAttrib && !isUrl) {
                return attrib.value;
            }
        }
    }

}
