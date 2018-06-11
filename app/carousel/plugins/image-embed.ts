import ImageBase from "./image";

export default class ImageEmbed extends ImageBase {
    get url() {
        return this.element.src;
    }

    get hasMinimalSize() {
        const img = this.element;
        const width = Number(img.getAttribute("data-mcext-width"));
        const height = Number(img.getAttribute("data-mcext-height"));
        return (
            width > 120 &&  // Attempt to exclude skyscraper ads
            height > 90 &&  // Attempt to exclude banner ads
            width * height > 250 * 250  // Exclude small images
        );
    }

    get canHandle() {
        // Exclude thumbnails and other tiny images.
        // http://gph.is/1efSlt9
        return Boolean(
            this.options["include.images"] &&
            this.element.tagName === "IMG" &&
            this.hasMinimalSize
        );
    }
}
