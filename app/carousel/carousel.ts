import "./carousel.css";
import Base from "./plugins/base";

export default class Carousel {

    public dom: Record<string, HTMLDivElement>;
    public animating: boolean = false;
    public max: number;
    public current: number = 0;
    public queue: number[] = [];
    public animDurationMs: number = 600;

    constructor(
        public slides: Base[],
        public options: Record<string, boolean>,
        public closeFn: () => void
    ) {
        this.max = slides.length;
        this.registerDomElements();
        this.addEventHandlers();
        this.setInitialSlides();
        this.updateNav();
        this.setTitle();
    }

    public registerDomElements() {
        this.dom = {
            current: document.querySelector("#current"),
            max: document.querySelector("#max"),
            next: document.querySelector("#next"),
            prev: document.querySelector("#prev"),
            slides: document.querySelector("#slides"),
            title: document.querySelector("#title"),
        };
    }

    public addEventHandlers() {
        const prev = this.navigate.bind(this, -1);
        const next = this.navigate.bind(this, 1);
        const toggleZoom = this.toggleZoom.bind(this);

        this.dom.prev.addEventListener("click", prev);
        this.dom.next.addEventListener("click", next);

        if (this.options["ui.dblclick.zoom"]) {
            this.dom.slides.addEventListener("dblclick", toggleZoom);
        }

        document.addEventListener("keydown", (event) => {
            switch (event.which) {
                case 27: this.closeFn(); break; // Esc
                case 37: prev(); break; // ◄
                case 39: next(); break; // ►
            }
        });
    }

    public setInitialSlides() {
        this.appendSlideWithIndex(this.current - 1);
        this.appendSlideWithIndex(this.current);
        this.appendSlideWithIndex(this.current + 1);
    }

    public navigate(delta: number) {
        const newCurrent = this.current + delta;
        const direction = delta === 1 ? "left" : "right";

        if (this.animating) {
            this.queue.push(delta);
            return;
        } else if (newCurrent === -1) {
            this.flashNav(this.dom.prev);
            return;
        } else if (newCurrent === this.max) {
            this.flashNav(this.dom.next);
            return;
        }

        this.dom.slides.classList.add(direction);
        this.animating = true;

        // Update title and nav halfway.
        window.setTimeout(() => {
            this.current = newCurrent;
            this.setTitle();
            this.updateNav();
        }, this.animDurationMs / 3);

        window.setTimeout(() => {
            if (delta === 1) {
                // Navigated to next slide:
                // Add new next slide and remove the former previous slide.
                this.appendSlideWithIndex(newCurrent + 1);
                this.removeSlideAtPosition(0);
            } else if (delta === -1) {
                // Navigated to previous slide:
                // Add new previous slide and remove the former next slide.
                this.removeSlideAtPosition(2);
                this.prependSlideWithIndex(newCurrent - 1);
            }

            this.dom.slides.classList.remove(direction);
            this.animating = false;

            // Next in queue, must be async or animation is skipped.
            if (this.queue.length) {
                window.setTimeout(() => {
                    this.navigate(this.queue.shift());
                }, 20);
            }
        }, this.animDurationMs * 0.7);
        // Can skip a bit of the animation when in a hurry.
    }

    public flashNav(element: HTMLElement) {
        element.classList.add("flash");
        window.setTimeout(() => element.classList.remove("flash"), 400);
    }

    get dummySlide() {
        return document.createElement("figure");
    }

    public getSlide(index: number) {
        return this.slides[index] ? this.slides[index].node : this.dummySlide;
    }

    public removeSlideAtPosition(position: number) {
        const removeSlide = this.dom.slides.childNodes[position] as HTMLElement;
        this.dom.slides.removeChild(removeSlide);
    }

    public prependSlideWithIndex(insertSlideIndex: number) {
        const insertSlide = this.getSlide(insertSlideIndex);
        const firstSlide = this.dom.slides.childNodes[0];
        this.dom.slides.insertBefore(insertSlide, firstSlide);
    }

    public appendSlideWithIndex(insertSlideIndex: number) {
        const insertSlide = this.getSlide(insertSlideIndex);
        this.dom.slides.appendChild(insertSlide);
    }

    public setTitle() {
        this.dom.current.textContent = String(this.current + 1);
        this.dom.max.textContent = String(this.max);
        this.dom.title.innerHTML = this.slides[this.current].title || "&#160;";
    }

    public updateNav() {
        const atFirst = this.current === 0;
        const atLast = this.current + 1 === this.max;
        this.dom.prev.classList.toggle("disabled", atFirst);
        this.dom.next.classList.toggle("disabled", atLast);
    }

    public toggleZoom() {
        const slide = this.slides[this.current];
        const node = this.dom.slides.childNodes[1] as HTMLElement;
        const classList = node.classList;

        if (!node || slide.zoom === 1) {
            // pass
        } else if (!classList.contains("zoom2x") && !classList.contains("zoom4x")) {
            node.classList.add("zoom2x");
        } else if (slide.zoom < 0.5 && !classList.contains("zoom4x")) {
            node.classList.remove("zoom2x");
            node.classList.add("zoom4x");
        } else {
            node.classList.remove("zoom2x", "zoom4x");
        }
    }

}
