/**
 * Throw an error if the response was no successful
 *
 * @param {Response} response - response object of the Fetch API. https://developer.mozilla.org/ru/docs/Web/API/Response
 */
export function handleErrors(response: Response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }

    return response;
}
