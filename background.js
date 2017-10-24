const openInTab = {};

function toggleState(tab, open) {
    openInTab[tab.id] = open;
    browser.browserAction.setIcon({
        tabId: tab.id,
        path: `icons/64-${open ? 'on' : 'off'}.png`
    });
}

browser.browserAction.onClicked.addListener((tab) => {

    // Toggle carousel.
    browser.tabs.executeScript(
        openInTab[tab.id] ?
            {code: 'window.postMessage("close-media-carousel", "*")'} :
            {file: 'inject-overlay.js'}
    );

    // Handle carousel reporting open/closed.
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender.tab.id === tab.id) {
            if (message.action === 'open') {
                toggleState(tab, true);
            } else if (message.action === 'close') {
                toggleState(tab, false);
            }
        }
    });
});
