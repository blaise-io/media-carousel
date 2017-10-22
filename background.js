// TODO: Toggling logic / detect toggle from within frame + tab-bound.

browser.browserAction.onClicked.addListener(() => {
    browser.tabs.executeScript({file: 'inject-overlay.js'});
});
