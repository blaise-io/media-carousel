const tabsWithCarousel = {};

// Set state and icon.
function updateState(tabId, hasCarousel) {
    tabsWithCarousel[tabId] = hasCarousel;
    updateIcon(tabId);
}

// Set icon and title.
function updateIcon(tabId) {
    const icon = tabsWithCarousel[tabId] ? 'close' : 'icon';
    const modifierKey = navigator.platform.match(/^mac/i) ? 'Cmd' : 'Ctrl';
    const title = tabsWithCarousel[tabId] ?
        'Close carousel (Esc)' :
        `Display media on this page in a carousel (${modifierKey}+Shift+M)`;
    browser.browserAction.setIcon({tabId: tabId, path: `icons/${icon}.svg`});
    browser.browserAction.setTitle({tabId: tabId, title: title});
}

// Set initial state.
browser.tabs.onActivated.addListener((activeInfo) => {
    updateIcon(activeInfo.tabId);
});

// New page in a tab won't have a carousel until the user adds it.
browser.tabs.onUpdated.addListener((tabId) => {
    updateState(tabId, false);
});

// Handle toolbar button click.
browser.browserAction.onClicked.addListener((tab) => {

    // Toggle carousel.
    browser.tabs.executeScript(tab.id,
        tabsWithCarousel[tab.id] ?
            {code: 'window.postMessage(`{"mcext": {"close": true}}`, "*")'} :
            {file: 'inject-overlay.js'}
    );

    // Handle carousel reporting open/closed.
    chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender.tab.id === tab.id) {
            if (message.action === 'open') {
                updateState(tab.id, true);
            } else if (message.action === 'close') {
                updateState(tab.id, false);
            }
        }
    });

});
