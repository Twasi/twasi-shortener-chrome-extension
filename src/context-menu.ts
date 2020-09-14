import {createShortLink} from "./shared";

chrome.contextMenus.create({
    contexts: ["link"],
    title: "Copy shortened URL",
    onclick: async info => {
        try {
            const elem = document.getElementById('url') as HTMLInputElement;
            elem.value = await createShortLink(info.linkUrl as string);
            elem.select();
            document.execCommand('copy');
            chrome.notifications.create({
                type: "basic",
                message: `Short URL '${elem.value}' copied!`,
                iconUrl: "../../icons/128.png",
                title: "Copied!"
            });
        } catch (e) {
            console.log(e);
            chrome.notifications.create({
                type: "basic",
                message: `An error occurred :c`,
                iconUrl: "../../icons/128.png",
                title: "Could not copy..."
            });
        }
    }
})
