const GraphQL = require('graphql.js')('https://twa.si/gql', {asJSON: true});

const load = (load: boolean) => {
    document.getElementById(load ? 'loading' : 'url-container')?.classList.remove('hide');
    document.getElementById(load ? 'url-container' : 'loading')?.classList.add('hide');
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
    const result = await GraphQL(`mutation { createPublicUrl(url: "${url}") { short, tag }}`)();
    console.log(result);
    if (elem) elem.value = `https://twa.si/${result.createPublicUrl.short}/${result.createPublicUrl.tag}`;
    load(false);
    copy();
});
