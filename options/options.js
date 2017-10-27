document.addEventListener('input', saveOptions);

let options = {};

const defaultOptionsPromise = new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', browser.extension.getURL('options/defaults.json'));
    xhr.send(null);
    xhr.onload = function() {
        resolve(JSON.parse(this.response));
    };
});

const savedOptionsPromise = browser.storage.sync.get('options');

Promise.all([defaultOptionsPromise, savedOptionsPromise]).then((result) => {
    options = Object.assign({}, result[0], result[1].options);
    restoreOptions();
    setLastSaved();
});

function restoreOptions() {
    document.querySelectorAll('input[type=checkbox][name]').forEach((input) => {
        input.checked = options[input.name];
    });
}

function saveOptions() {
    options = {'meta.lastSaved': new Date().toISOString()};
    document.querySelectorAll('input[type=checkbox][name]').forEach((input) => {
        options[input.name] = input.checked;
    });
    browser.storage.sync.set({options}).then(setLastSaved);
}

function setLastSaved() {
    if (options['meta.lastSaved']) {
        const lastSavedElement = document.querySelector('#last-saved');
        const time = (new Date(options['meta.lastSaved'])).toTimeString();
        lastSavedElement.textContent = `Last saved at ${time}`;
        lastSavedElement.style.display = 'block';
    }
}