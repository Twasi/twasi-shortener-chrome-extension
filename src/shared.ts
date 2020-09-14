const GraphQL = require('graphql.js')('https://twa.si/gql', {asJSON: true});


export const createShortLink = async (url: string): Promise<string> => {
    let result = await GraphQL(`mutation { createPublicUrl(url: "${url}") { short, tag }}`)();
    if (result) {
        result = result.createPublicUrl;
        return `https://twa.si/${result.short}/${result.tag}`;
    }
    throw new Error("An error occured");
}
