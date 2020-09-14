import {createShortLink} from "./shared";

const loadingRef = document.getElementById('loading') as HTMLDivElement;
const urlContainerRef = document.getElementById('url-container') as HTMLDivElement;
const errorRef = document.getElementById('error') as HTMLDivElement;

const load = (load: boolean) => {
    loadingRef.classList[load ? 'remove' : 'add']('hide');
    urlContainerRef.classList[!load ? 'remove' : 'add']('hide');
    errorRef.classList.add('hide');
}

const error = (msg: string) => {
    [loadingRef, urlContainerRef].forEach(x => x.classList.add('hide'));
    errorRef.innerText = msg;
    errorRef.classList.remove('hide');
}

load(true);

const copy = () => {
    const copyText = document.getElementById("url") as HTMLInputElement;
    copyText.select();
    copyText.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
}

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
            error("Unable to create shortlink.");
        console.log(e);
    }
});


