import * as iconImage from "./icons/icon.png";

const manifest = {
    manifest_version: 2,
    name: "Media Carousel",
    version: process.env.npm_package_version,
    description: process.env.npm_package_description,
    homepage_url: process.env.npm_package_homepage,
    permissions: ["activeTab", "storage"],
    background: {
        scripts: ["/background.js"],
    },
    applications: undefined,
    icons: {
        128: iconImage,
    },
    browser_action: {
        default_icon: iconImage,
        browser_style: undefined,
    },
    web_accessible_resources: ["/carousel.html"],
    options_ui: {
        page: "/options.html",
        browser_style: undefined,
    },
    commands: {
        _execute_browser_action: {
            suggested_key: {
                default: "Ctrl+Shift+M",
                windows: "Ctrl+Shift+M",
                linux: "Ctrl+Shift+M",
                mac: "Command+Shift+M",
            },
        },
    },
};

if (process.env.BROWSER === "firefox") {
    manifest.applications = {
        gecko: {
            id: `${process.env.npm_package_name}@blaise.io`,
        },
    };
    manifest.options_ui.browser_style = true;
    manifest.browser_action.browser_style = false;
}

module.exports = JSON.stringify(manifest, null, 2);
