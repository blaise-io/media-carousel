// Use CommonJS in this file for compatibility with ExtractTextPlugin.
// tslint:disable:no-var-requires

const manifest = {
    manifest_version: 2,
    name: "Media Carousel",
    version: process.env.npm_package_version,
    description: process.env.npm_package_description,
    homepage_url: process.env.npm_package_homepage,
    permissions: ["activeTab", "storage"],
    background: {
        scripts: ["/background.js"]
    },
    applications: undefined,
    browser_action: {
        browser_style: undefined,
        default_icon: undefined,
    },
    icons: undefined,
    web_accessible_resources: ["/carousel.html"],
    options_ui: {
        page: "/options.html",
    },
    commands: {
        _execute_browser_action: {
            suggested_key: {
                default: "Ctrl+Shift+M",
                windows: "Ctrl+Shift+M",
                linux: "Ctrl+Shift+M",
                mac: "Command+Shift+M",
            }
        }
    }
};

if (process.env.BROWSER === "firefox") {
    manifest.applications = {
        gecko: {
            id: `${process.env.npm_package_name}@blaise.io`
        }
    };
    manifest.icons = {128: require("./icons/icon.svg")};
    manifest.browser_action.browser_style = true;
    manifest.browser_action.default_icon = require("./icons/icon.svg");
} else {
    manifest.icons = {128: require("./icons/icon.png")};
    manifest.browser_action.default_icon = require("./icons/icon.png");
}

module.exports = JSON.stringify(manifest, null, 2);
