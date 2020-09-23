import {createShortLink} from "./shared";

/**
 * Register context menu entry
 */
chrome.contextMenus.create({
    contexts: ["link"],
    title: "Copy shortened URL",

    onclick: async info => {
        try {
            // Get HTML input
            const elem = document.getElementById('url') as HTMLInputElement;

            // Set input value to created url
            elem.value = await createShortLink(info.linkUrl as string);

            // Select and copy input value
            elem.select();
            document.execCommand('copy');

            // Notify user
            chrome.notifications.create({
                type: "basic",
                message: `Short URL '${elem.value}' copied!`,
                iconUrl: "../../icons/128.png",
                title: "Copied!"
            });
        } catch (e) {
            console.log(e);

            // Notify user about error
            chrome.notifications.create({
                type: "basic",
                message: `An error occurred :c`,
                iconUrl: "../../icons/128.png",
                title: "Could not copy..."
            });
        }
    }
});
