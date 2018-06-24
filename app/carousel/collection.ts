import {enabledPlugins} from "./plugins";

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

    public handleElement(element, slides) {
        enabledPlugins.forEach((PluginClass) => { // See plugins.js
            const plugin = new PluginClass(element, this.options);
            if (plugin.canHandle) {
                const index = this.getSlideIndex(slides, plugin.url);
                if (index !== -1) {
                    // Overwrite slide with same URL,
                    // as specific plugins run last.
                    slides[index] = plugin;
                } else {
                    slides.push(plugin);
                }
            }
        });
    }

    public getSlideIndex(slides, url) {
        for (let i = 0, m = slides.length; i < m; i++) {
            if (slides[i].url === url) {
                return i;
            }
        }
        return -1;
    }
}
