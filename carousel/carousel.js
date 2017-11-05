/**
 * TODO, maybe:
 * Replace no media alert with HTML
 * Design "No media" message
 * Zoom indicator and click to real-size / scroll
 * Preload multiple slides
 */

class Carousel {

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

    registerDomElements() {
        this.dom = {
            slides: document.querySelector('#slides'),
            prev: document.querySelector('#prev'),
            next: document.querySelector('#next'),
            title: document.querySelector('#title'),
            current: document.querySelector('#current'),
            max: document.querySelector('#max'),
        };
    }

    addEventHandlers() {
        const prev = this.navigate.bind(this, -1);
        const next = this.navigate.bind(this, 1);

        this.dom.prev.addEventListener('click', prev);
        this.dom.next.addEventListener('click', next);

        document.addEventListener('keydown', (event) => {
            switch (event.which) {
                case 27: this.closeFn(); break; // Esc
                case 37: prev();  break; // ◄
                case 39: next();  break; // ►
            }
        });
    }

    setInitialSlides() {
        this.appendSlideWithIndex(this.current - 1);
        this.appendSlideWithIndex(this.current);
        this.appendSlideWithIndex(this.current + 1);
    }

    navigate(delta) {
        const newCurrent = this.current + delta;
        const direction = delta === 1 ? 'left' : 'right';

        if (this.animating || newCurrent === -1 || newCurrent === this.max) {
            return;
        }

        this.dom.slides.classList.add('animate', direction);
        this.animating = true;

        window.setTimeout(() => {
            this.current = newCurrent;
            this.dom.slides.classList.remove('animate');
            this.dom.slides.classList.remove(direction);
            this.animating = false;

            // Navigated to next slide:
            // Add a new upcoming slide and remove the former previous slide.
            if (delta === 1) {
                this.appendSlideWithIndex(newCurrent + 1);
                this.removeSlideAtPosition(0);
            }

            // Navigated to previous slide:
            // Add a new previous slide and remove the former next slide.
            else if (delta === -1) {
                this.removeSlideAtPosition(2);
                this.prependSlideWithIndex(newCurrent - 1);
            }

            this.setTitle();
            this.updateNav();
        }, 200);
    }

    get dummySlide() {
        return document.createElement('figure');
    }

    getSlide(index) {
        return this.slides[index] ? this.slides[index].node : this.dummySlide;
    }

    removeSlideAtPosition(position) {
        const removeSlide = this.dom.slides.childNodes[position];
        this.dom.slides.removeChild(removeSlide);
    }

    prependSlideWithIndex(insertSlideIndex) {
        const insertSlide = this.getSlide(insertSlideIndex);
        const firstSlide = this.dom.slides.childNodes[0];
        this.dom.slides.insertBefore(insertSlide, firstSlide);
    }

    appendSlideWithIndex(insertSlideIndex) {
        const insertSlide = this.getSlide(insertSlideIndex);
        this.dom.slides.appendChild(insertSlide);
    }

    setTitle() {
        this.dom.current.textContent = String(this.current + 1);
        this.dom.max.textContent = String(this.max);
        // TODO: Find safer way to display html entities.
        this.dom.title.innerHTML = this.slides[this.current].title;
    }

    updateNav() {
        const atFirst = this.current === 0;
        const atLast = this.current + 1 === this.max;
        this.dom.prev.classList.toggle('disabled', atFirst);
        this.dom.next.classList.toggle('disabled', atLast);
    }

}

window.Carousel = Carousel;
