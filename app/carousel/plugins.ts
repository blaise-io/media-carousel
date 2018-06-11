import GfyCat from "./plugins/gfycat";
import ImageEmbed from "./plugins/image-embed";
import ImageLink from "./plugins/image-link";
import ImgurAlbum from "./plugins/imgur-album";
import ImgurGifv from "./plugins/imgur-gifv";
import StreamableLink from "./plugins/streamable-link";
import VimeoLink from "./plugins/vimeo-link";
import YouTubeLink from "./plugins/youtube-link";

/**
 * TODO, maybe:
 * Delay playback of videos until slide is visible
 * Preload more content
 * Async plugins
 * Use Imgur API for albums
 * Use Gfycat API for video URL
 * Embedded video plugin for <video> tags
 * Vimeo API to control volume so we can respect "muted" option
 * Handle hosts preventing hotlinking
 */

 // TODO: Order
export const enabledPlugins = [
    GfyCat,
    ImageEmbed,
    ImageLink,
    ImgurAlbum,
    ImgurGifv,
    StreamableLink,
    VimeoLink,
    YouTubeLink,
];
