import config from './config';

/**
 * Create a shortlink using the twasi-shortener graphql-api provided in the config
 * @param url
 */
export const createShortLink = async (url: string): Promise<string> => {
    // Check for jwt
    const jwt: string | null = await getCachedJwt();

    // Check for cache url
    const cached = getCachedShortlink(url, typeof jwt === "string");
    if (cached) return cached;

    // Instantiate GraphQL client and set authorization header if jwt is available
    const GraphQL = require('graphql.js')(config.API_URL, {asJSON: true});
    if (jwt) GraphQL.headers({authorization: jwt});

    setLoadingText('Creating new shortlink...');

    // Create shortlink
    let result = await GraphQL(`mutation { create${jwt ? '' : 'Public'}Url(redirection: "${url}") { short, tag }}`)();
    if (result) {
        console.log(result);
        result = result.createPublicUrl || result.createUrl;
        const outUrl = `${config.PAGE_URL}/${result.short}/${result.tag}`;
        cacheShortlink(url, outUrl, typeof jwt === "string");
        return outUrl;
    }
    throw new Error("An error occured");
}

/**
 * This function tries to get and cache the JWT.
 *
 * First time this method is called (and also if the cache hasn't been updated for at
 * least an hour), it tries to get the JWT, caches it and returns it.
 * The following times it'll instantly return the cached JWT (or undefined if not
 * logged in) and refresh the JWT asynchronously to make the user not wait unnecessarily.
 */
export const getCachedJwt = async () => {
    setLoadingText('Checking login status...');

    // Get last update timestamp
    const timestamp = localStorage.getItem('lastJwtUpdate');

    // Function for updating the JWT and the update timestamp in extension's localStorage
    const jwtUpdate = (jwt: string | null): string | null => {
        if (jwt) localStorage.setItem('JWT', jwt);
        else localStorage.removeItem('JWT');
        localStorage.setItem('lastJwtUpdate', Date.now().toString());
        return jwt;
    }

    const updateAsynchronously = () =>
        getJwt(true)
            .then(jwtUpdate)
            .catch(console.error);

    // If there was no update yet or the update was at least an hour, wait for a fresh JWT-update to arrive before returning it
    if (!timestamp || timestamp && parseInt(timestamp) < (Date.now() - (60 * 60 * 1000))) { // Check at least every hour
        try {
            const jwt = await getJwt();
            return jwtUpdate(jwt);
        } catch (e) {
        }
    }

    // Otherwise do that asynchronously ...
    updateAsynchronously().then();

    // ... and return cached JWT
    const jwt = localStorage.getItem('JWT');
    return jwt ? jwt : null;
}

/**
 * This function creates an iframe to communicate with the shortener
 * via postMessage to get the current JWT from it's localStorage.
 *
 * This only succeeds if the extensions ID is permitted at the shortener
 * backend. Otherwise the iframe won't leak the JWT.
 */
export const getJwt = async (noReject?: boolean): Promise<string | null> => {
    setLoadingText(`Reading login from ${config.PAGE_URL}...`);
    return new Promise(async (res, rej) => {

        // Create and append hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = config.JWT_GETTER_URL;
        document.body.appendChild(iframe);

        // Wait for it to load
        await new Promise(res => iframe.onload = res);

        // @ts-ignore
        window.onmessage = (ev => res(ev.data.JWT || null));
        iframe.contentWindow?.postMessage('get-jwt', '*');

        // Reject after 1.5 sec because this takes too long.
        if (!noReject) setTimeout(rej, 1500);
    });
}

type UrlCacheItem = {
    authenticated: boolean,
    timestamp: number,
    shortUrl: string,
    url: string
}

/**
 * Get the current URL cache
 */
export const getUrlCache = (): Array<UrlCacheItem> => {
    const rawCache = localStorage.getItem('urlCache');
    try {
        return rawCache ? JSON.parse(rawCache) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Add a new URL to the current URL cache
 * @param item The item to add
 */
export const addToUrlCache = (item: UrlCacheItem) => {
    const cache = getUrlCache();
    cache.push(item);
    localStorage.setItem('urlCache', JSON.stringify(cache));
}

/**
 * Function for caching and getting cached shortlinks.
 * @param url The url to lookup in cache
 * @param authenticated Whether the user is currently authenticated
 */
export const getCachedShortlink = (url: string, authenticated: boolean): string | null => {
    const urlQuery = getUrlCache().find(x => x.url === url && x.authenticated === authenticated);
    invalidateCache();
    return urlQuery ? urlQuery.shortUrl : null;
}

/**
 * Caches a shortlink.
 * This happens asynchronously to not interrupt the user experience.
 * @param url The URL that should be shortened
 * @param shortUrl The shortened URL
 * @param authenticated Whether the shortlink was created authenticated
 */
export const cacheShortlink = (url: string, shortUrl: string, authenticated: boolean) => {
    (async () => {
        addToUrlCache({timestamp: Date.now(), url, shortUrl, authenticated});
    })()
}

/**
 * Invalidates cache for outdated shortlinks (older than 1h).
 * This happens asynchronously to not interrupt the user experience.
 */
export const invalidateCache = () => {
    (async () => {
        const cache = getUrlCache().filter(x => x.timestamp > (Date.now() - (60 * 60 * 1000)));
        localStorage.setItem('urlCache', JSON.stringify(cache));
    })()
}

const setLoadingText = (text: string) => {
    const elem = document.getElementById('loading-text');
    if (!elem) return;
    elem.innerText = text;
}
