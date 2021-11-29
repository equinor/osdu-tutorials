import { handleErrors } from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

interface Wellbore {
    id: string,
    data: {
        "Datasets": [string]
    }
}

export interface FindWellboreResponse {
    results: Wellbore[];
}

/**
 * Return well log data by a given id
 */
export async function findWellLogDatasetsById(wellboreId: string): Promise<FindWellboreResponse> {
    const accessToken = await getAccessToken();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:work-product-component--WellLog:1.0.0",
            "query": `data.WellboreID:(\"${wellboreId}\")`,
            "returnedFields": [
                "id",
                "data.Datasets"
            ]
        })
    };

    return fetch("/api/search/v2/query", requestOptions)
        .then(handleErrors)
        .then(response => response.json())
}