import { handleErrors } from "./handleErrors";
import {getAccessToken} from "./getAccessToken";
import {URLSearchParams} from "url";

interface WellLog {
    id: string
}

export interface FindWellLogResponse {
    results: WellLog[];
}

async function getWellLogs(accessToken: string, wellboreId: string): Promise<FindWellLogResponse> {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'oaktree-acorn',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:work-product-component--Welllog:1.0.0",
            "query": `data.WellboreID:(\"${wellboreId}\")`,
            "returnedFields": [
                "id"
            ]
        })
    };
    return fetch("/api/search/v2/query", requestOptions)
        .catch(handleErrors)
        .then(response => response.json());
}

/**
 * Return well log data by a given id
 */
export async function loadWellLogData(wellboreId: string): Promise<any> {
    const accessToken = await getAccessToken();
    const wellLogs = await getWellLogs(accessToken, wellboreId);

    //const params = {"curves": "DEPTH, GR"}
    //const searchParams = new URLSearchParams(params);
    //console.log("search", searchParams.toString())

    const ddmsUrl = `/api/os-wellbore-ddms/ddms/v3/welllogs/${wellLogs.results[0].id}/data?curves=DEPTH,GR`;
    const requestOptions = {
        method: 'GET',
        headers: {
            'data-partition-id': 'oaktree-acorn',
            'Authorization': `Bearer ${accessToken}`,
            "accept": "application/json"
        },
    }
    return fetch(ddmsUrl, requestOptions)
        .then(handleErrors)
        .then(response => response.json())
}