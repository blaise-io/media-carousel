import GfyCat from "./plugins/gfycat";
import ImageEmbed from "./plugins/image-embed";
import ImageLink from "./plugins/image-link";
import ImgurAlbum from "./plugins/imgur-album";
import ImgurGifv from "./plugins/imgur-gifv";
import StreamableLink from "./plugins/streamable-link";
import TumblrArchive from "./plugins/tumblr-archive";
import VimeoLink from "./plugins/vimeo-link";
import YouTubeLink from "./plugins/youtube-link";

export const enabledPlugins = [
    TumblrArchive,
    ImageEmbed,
    ImageLink,
    ImgurGifv,
    GfyCat,
    ImgurAlbum,
    YouTubeLink,
    VimeoLink,
    StreamableLink,
];
