import "./carousel.css";
import Base from "./plugins/base";

/**
 * TODO, maybe:
 * Replace no media alert with HTML
 * Design "No media" message
 * Zoom indicator and click to real-size / scroll
 * Preload multiple slides
 */

export default class Carousel {

    public dom: Record<string, HTMLDivElement>;
    public slides: Base[];
    public closeFn: FunctionConstructor;
    public animating: boolean;
    public max: number;
    public current: number;

    constructor(slides, closeFn) {
        this.slides = slides;
        this.closeFn = closeFn;

        this.animating = false;
        this.current = 0;
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

        this.dom.prev.addEventListener("click", prev);
        this.dom.next.addEventListener("click", next);

        document.addEventListener("keydown", (event) => {
            switch (event.which) {
                case 27: this.closeFn(); break; // Esc
                case 37: prev();  break; // ◄
                case 39: next();  break; // ►
            }
        });
    }

    public setInitialSlides() {
        this.appendSlideWithIndex(this.current - 1);
        this.appendSlideWithIndex(this.current);
        this.appendSlideWithIndex(this.current + 1);
    }

    public navigate(delta) {
        const newCurrent = this.current + delta;
        const direction = delta === 1 ? "left" : "right";

        if (this.animating) {
            return;
        } else if (newCurrent === -1) {
            this.flashNav(this.dom.prev);
            return;
        } else if (newCurrent === this.max) {
            this.flashNav(this.dom.next);
            return;
        }

        this.dom.slides.classList.add("animate", direction);
        this.animating = true;

        window.setTimeout(() => {
            // Set essentials
            this.current = newCurrent;
            this.animating = false;
            this.setTitle();
            this.updateNav();

            // Animating can come later when user wants to scroll hard.
            window.setTimeout(() => {
                this.dom.slides.classList.remove("animate");
                this.dom.slides.classList.remove(direction);

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
            }, 400);

        }, 200);
    }

    public flashNav(element) {
        element.classList.add("flash");
        window.setTimeout(() => element.classList.remove("flash"), 400);
    }

    get dummySlide() {
        return document.createElement("figure");
    }

    public getSlide(index) {
        return this.slides[index] ? this.slides[index].node : this.dummySlide;
    }

    public removeSlideAtPosition(position) {
        const removeSlide = this.dom.slides.childNodes[position];
        this.dom.slides.removeChild(removeSlide);
    }

    public prependSlideWithIndex(insertSlideIndex) {
        const insertSlide = this.getSlide(insertSlideIndex);
        const firstSlide = this.dom.slides.childNodes[0];
        this.dom.slides.insertBefore(insertSlide, firstSlide);
    }

    public appendSlideWithIndex(insertSlideIndex) {
        const insertSlide = this.getSlide(insertSlideIndex);
        this.dom.slides.appendChild(insertSlide);
    }

    public setTitle() {
        this.dom.current.textContent = String(this.current + 1);
        this.dom.max.textContent = String(this.max);
        this.dom.title.innerHTML = this.slides[this.current].title;
    }

    public updateNav() {
        const atFirst = this.current === 0;
        const atLast = this.current + 1 === this.max;
        this.dom.prev.classList.toggle("disabled", atFirst);
        this.dom.next.classList.toggle("disabled", atLast);
    }

}
