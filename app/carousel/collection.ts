import { enabledPlugins } from "./plugins";

export default class SlideCollection {

    constructor(public html, public options) {
    }

    // Elements to consider by plugins.
    get query() {
        return ["a[href]", "img[src]", "video", "iframe"];
    }

    get elements() {
        const shadowDocument = document.createElement("shadow");
        shadowDocument.innerHTML = this.html;
        return shadowDocument.querySelectorAll(this.query.join(","));
    }

    get slides() {
        const slides = [];
        Array.from(this.elements).forEach((element) => {
            this.handleElement(element, slides);
        });
        return slides;
    }

    private handleElement(element, slides) {
        enabledPlugins.forEach((PluginClass) => {
            const newSlide = new PluginClass(element, this.options);
            if (newSlide.canHandle) {
                const exSlide = slides.find((s) => s.url === newSlide.url);
                if (!exSlide) {
                    slides.push(newSlide);
                } else if (!exSlide.title && newSlide.title) {
                    slides[slides.indexOf(exSlide)] = newSlide;
                }
            }
        });
    }

}
