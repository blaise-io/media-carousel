const tabsWithCarousel = {};

// Toggle icon for tab.
function toggleState(tabId, open) {
    tabsWithCarousel[tabId] = open;
    browser.browserAction.setIcon({
        tabId: tabId,
        path: `icons/64-${open ? 'on' : 'off'}.png`
    });
}

// Handle toolbar button click.
browser.browserAction.onClicked.addListener((tab) => {

    // Toggle carousel.
    browser.tabs.executeScript(
        tabsWithCarousel[tab.id] ?
            {code: 'window.postMessage("close-media-carousel", "*")'} :
            {file: 'inject-overlay.js'}
    );

    // Handle carousel reporting open/closed.
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender.tab.id === tab.id) {
            if (message.action === 'open') {
                toggleState(tab.id, true);
            } else if (message.action === 'close') {
                toggleState(tab.id, false);
            }
        }
    });

});

// Toggle state when navigating to another page.
browser.tabs.onUpdated.addListener((tabId) => {
    if (tabsWithCarousel[tabId]) {
        toggleState(tabId, false);
    }
});
