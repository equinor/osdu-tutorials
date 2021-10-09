import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

export interface Activity {
    id: string,
    data: {
        startTime: string,
        finishTime: string,
        allocatedHours: number,
    }
};

export interface LoadActivityResponse {
    results: Activity[];
};

export async function loadActivities(heliportId: string): Promise<LoadActivityResponse> {
    const accessToken = await getAccessToken();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": `id:(\\"${heliportId}\\")`,
            "query": " ",
            "returnedFields": [
                "id",
                "data.AllocatedHours",
                "data.EarlyStartDateTime",
                "data.EarlyFinishDateTime"
            ]
        })
    };

    return fetch("/api/search/v2/query", requestOptions)
        .then(handleErrors)
        .then(response => response.json());
}
