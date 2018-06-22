// Use CommonJS modules for compatibility with ExtractTextPlugin.
module.exports = {
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
