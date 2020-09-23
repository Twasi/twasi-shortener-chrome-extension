import config from './config';

/**
 * Create a shortlink using the twasi-shortener graphql-api provided in the config
 * @param url
 */
export const createShortLink = async (url: string): Promise<string> => {

    // Instantiate GraphQL client
    const GraphQL = require('graphql.js')(config.API_URL, {asJSON: true});

    // Check for jwt and set authorization header if available
    const jwt: string | null = await getJwt();
    if (jwt) GraphQL.headers({authorization: jwt});

    // Create shortlink
    let result = await GraphQL(`mutation { create${jwt ? '' : 'Public'}Url(redirection: "${url}") { short, tag }}`)();
    if (result) {
        console.log(result);
        result = result.createPublicUrl || result.createUrl;
        return `https://twa.si/${result.short}/${result.tag}`;
    }
    throw new Error("An error occured");
}

export const getJwt = async (): Promise<string | null> => {
    return new Promise((res, rej) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = "none";
        iframe.src = config.JWT_GETTER_URL;
        document.body.appendChild(iframe);
        iframe.onload = () => {
            // @ts-ignore
            window.onmessage = (ev => {
                res(ev.data.JWT || null);
            })
            iframe.contentWindow?.postMessage('get-jwt', '*');
        }
        setTimeout(rej, 1500);
    });
}
