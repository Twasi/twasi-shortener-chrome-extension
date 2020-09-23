import {createShortLink} from "./shared";

/**
 * Declare DOM references
 */
const loadingRef = document.getElementById('loading') as HTMLDivElement;
const urlContainerRef = document.getElementById('url-container') as HTMLDivElement;
const errorRef = document.getElementById('error') as HTMLDivElement;

/**
 * Function for setting loading-state
 * @param load Whether to enable or disable loading-state
 */
const load = (load: boolean) => {
    loadingRef.classList[load ? 'remove' : 'add']('hide');
    urlContainerRef.classList[!load ? 'remove' : 'add']('hide');
    errorRef.classList.add('hide');
}

/**
 * Set loading state to true by opening the extension popup
 */
load(true);

/**
 * Function for showing an error message to the user
 * @param msg
 */
const error = (msg: string) => {
    [loadingRef, urlContainerRef].forEach(x => x.classList.add('hide'));
    errorRef.innerText = msg;
    errorRef.classList.remove('hide');
}

/**
 * Function for copying the created url
 */
const copy = () => {
    const copyText = document.getElementById("url") as HTMLInputElement;
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
}

/**
 * Query the current tab's URL, create a shortlink and copy it
 */
chrome.tabs.query({"active": true, "lastFocusedWindow": true}, async tabs => {
    const url = tabs[0].url || '';
    const elem = document.getElementById('url') as HTMLInputElement;
    try {
        elem.value = await createShortLink(url);
        load(false);
        copy();
    } catch (e) {
        if (!(url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://')))
            error('The current tab doesn\'t have a valid URL to shorten.');
        else
            error(`Unable to create shortlink${Array.isArray(e) ? ': ' + e[0].message : '.'}`);
        console.log(e);
    }
});
