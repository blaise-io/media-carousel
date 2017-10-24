const defaultOptions = {
    'include.embeddedImages': false,
    'include.linkedImages': true,
    'include.embeddedVideos': true,
    'include.linkedVideos': true,
    'video.mute': true,
    'video.loop': true,
    'video.autoplay': true
};

browser.storage.sync.get('options').then((result) => {
    restoreOptions(result.options);
});

document.addEventListener('input', saveOptions);

function restoreOptions(options) {
    document.querySelectorAll('input[type=checkbox][name]').forEach((input) => {
        input.checked = getValue(options, input.name);
    });
}

function saveOptions() {
    const options = {};
    document.querySelectorAll('input[type=checkbox][name]').forEach((input) => {
        options[input.name] = input.checked;
    });
    browser.storage.sync.set({options}).then(setLastSaved);
}

function setLastSaved() {
    const lastSavedElement = document.querySelector('#last-saved');
    const time = (new Date()).toLocaleTimeString();
    lastSavedElement.textContent = `Last saved at ${time}`;
    lastSavedElement.style.display = 'block';
}

function getValue(options, name) {
    return typeof options[name] === 'undefined' ?
        defaultOptions[name] :
        options[name];
}
