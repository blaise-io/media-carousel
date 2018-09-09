import Base from "./base";

export default class ImageBase extends Base {
    get img() {
        const img = document.createElement("img");
        img.src = this.url;
        img.title = this.title;
        return img;
    }

    get node() {
        const figure = this.figure;
        figure.appendChild(this.img);
        return figure;
    }

    get imgExtRegexp() {
        return /\.(bmp|jpeg|jpg|gif|png|svg)$/i;
    }

    get zoom() {
        const img = this.img;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        return (w > vw || h > vh) ? Math.min(vw / w, vh / h) : 1;
    }
}
