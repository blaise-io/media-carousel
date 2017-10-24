var opened = {};

function toggle(open) {
    opened[tab.id] = open;
    browser.browserAction.setIcon({
        tabId: tab.id,
        path: `icons/64-${open ? 'on' : 'off'}.png`
    });
}

browser.browserAction.onClicked.addListener((tab) => {
    if (!opened[tab.id]) {
        browser.tabs.executeScript({file: 'inject-overlay.js'});
    } else {
        browser.tabs.executeScript({code: "window.parent.postMessage('close-media-carousel', '*');"});
    }

    // Handle carousel closing itself.
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender.tab.id === tab.id) {
            if (message.action === 'open') {
                toggle(tab, true);
            } else if (message.action === 'close') {
                toggle(tab, false);
            }
        }
    });
});
