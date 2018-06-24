import ImageLink from "./image-link";

export default class TumblrArchive extends ImageLink {

    get title() {
        const tags = this.element.querySelector(".tags");
        return tags ? tags.textContent.trim() : super.title;
    }

    get url() {
        try {
            const postElement = this.element.closest(".post");
            const thumbContainer = postElement.querySelector("[data-imageurl]");
            const thumbnailUrl = thumbContainer.getAttribute("data-imageurl");
            return thumbnailUrl.replace("_250.", "_1280.");
        } catch (error) {
            return;
        }
    }

    get canHandle() {
        return Boolean(
            this.options["include.images"] &&
            this.element.tagName === "A" &&
            this.element.href.match(/tumblr\.com\/post/) &&
            this.url
        );
    }
}
