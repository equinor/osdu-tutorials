import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

export interface Heliport {
    id: string
};

export interface LoadHeliportResponse {
    results: Heliport[];
};

export async function loadHeliports(): Promise<LoadHeliportResponse> {
    const accessToken = await getAccessToken();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:master-data--Heliport:1.0.0",
            "query": " ",
            "returnedFields": [
                "id",
            ]
        })
    };

    return fetch("/api/search/v2/query", requestOptions)
        .then(handleErrors)
        .then(response => response.json());
}
