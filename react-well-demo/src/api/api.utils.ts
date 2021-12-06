import {handleErrors} from "./handleErrors";

interface Dataset {
    data: {
        Datasets: string[]
    }
}

export interface DatasetResponse {
    results: Dataset[]
}


interface FetchFileDownloadUrl {
    SignedUrl: string
}

export async function getDownloadUrl(accessToken: string, dataset: string): Promise<FetchFileDownloadUrl> {
    const url = `/api/file/v2/files/${dataset}/downloadURL`;

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        }
    };

    return fetch(url, requestOptions)
        .catch(handleErrors)
        .then(response => response.json());
}
