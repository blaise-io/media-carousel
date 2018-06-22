const config = require('./common.js');
const svgIcon = require('../icons/icon.svg');
const pngIcon = require('../icons/icon.png');

if (process.env.BROWSER === "firefox") {
    config.browser_action.browser_style = true;
    config.browser_action.default_icon = svgIcon;
    config.applications = {
        gecko: {
            id: `${process.env.npm_package_name}@blaise.io`
        }
    };
} else {
    config.browser_action.default_icon = pngIcon;
    config.icons = {"128": pngIcon};
}

module.exports = JSON.stringify(config, null, indent=2);
