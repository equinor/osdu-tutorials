import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";
import {parseString} from "@fast-csv/parse";

export interface WellboreTrajectoryPoint {
    md: number,
    tvd: number,
    azimuth: number,
    inclination: number,
    longitude: number,
    latitude: number
}

export interface WellboreTrajectoryData {
    points: WellboreTrajectoryPoint[]
}

export interface LoadWellboreTrajectoryResponse {
    wellboreId: string,
    data: WellboreTrajectoryData,
}

interface FetchFileDownloadUrl {
    SignedUrl: string
}

async function getDownloadUrl(accessToken: string, dataset: string): Promise<FetchFileDownloadUrl> {
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

interface Dataset {
    data: {
        Datasets: string[]
    }
}

interface DatasetResponse {
    results: Dataset[]
}

async function getDatasetsFromWellboreTrajectory(accessToken: string, wellboreId: string): Promise<DatasetResponse> {

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:work-product-component--WellboreTrajectory:1.1.0",
            "query": "data.WellboreID:(\"opendes:master-data--Wellbore:ad215042-05db-2b7e-e053-c818a488c79a\")",
            //"query": `data.WellboreID:(\"${wellboreId}\")`,
            "returnedFields": [
                "data.Datasets",
            ]
        })
    };
    return fetch("/api/search/v2/query", requestOptions)
        .catch(handleErrors)
        .then(response => response.json());
}

async function downloadTrajectory(downloadUrl: string): Promise<string> {
    return fetch(downloadUrl, {
        method: "GET",
        redirect: "follow"
    })
        .catch(handleErrors)
        .then(response => response.text())
}

/**
 * Return wellbore_trajectory trajectory by a given id
 */
export async function loadWellboreTrajectory(wellboreId: string): Promise<WellboreTrajectoryData> {
    const accessToken = await getAccessToken();
    const datasets = await getDatasetsFromWellboreTrajectory(accessToken, wellboreId);
    const trajectoryDataset = datasets.results[0].data.Datasets[0].slice(0, -1);
    const downloadUrl = await getDownloadUrl(accessToken, trajectoryDataset);

    let trajectoryPoints: WellboreTrajectoryData = {
        points: []
    };

    let trajectoryData = await downloadTrajectory(downloadUrl.SignedUrl);
    parseString(trajectoryData, {delimiter: ",", headers: true})
        .on("error", err => console.error(err))
        .on("data", row => {
            let point: WellboreTrajectoryPoint = {
                md: row["MD"],
                tvd: row["TVD"],
                azimuth: row["AZIMUTH"],
                inclination: row["INCLINATION"],
                latitude: row["LATITUDE"],
                longitude: row["LONGITUDE"]
            }
            trajectoryPoints.points.push(point);
        })

    return trajectoryPoints;
}