import { handleErrors } from "./handleErrors";
import { getAccessToken } from "./getAccessToken";
import { parseString } from "@fast-csv/parse";
import { DatasetResponse, getDownloadUrl } from "./api.utils";

export interface WellboreTrajectoryPoint {
  md: number;
  tvd: number;
  azimuth: number;
  inclination: number;
  longitude: number;
  latitude: number;
}

export interface WellboreTrajectoryData {
  points: WellboreTrajectoryPoint[];
}

export interface LoadWellboreTrajectoryResponse {
  wellboreId: string;
  data: WellboreTrajectoryData;
}

async function getDatasetsFromWellboreTrajectory(
  accessToken: string
): Promise<DatasetResponse> {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "data-partition-id": "oaktree-acorn",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      kind: "osdu:wks:work-product-component--WellboreTrajectory:1.1.0",
      returnedFields: ["id", "data.WellboreID"],
    }),
  };
  return fetch("/api/search/v2/query", requestOptions)
    .catch(handleErrors)
    .then((response) => response.json());
}

async function downloadTrajectory(downloadUrl: string): Promise<string> {
  return fetch(downloadUrl, {
    method: "GET",
    redirect: "follow",
  })
    .catch(handleErrors)
    .then((response) => response.text());
}

async function parseTrajectory(
  trajectoryData: string
): Promise<WellboreTrajectoryPoint[]> {
  return new Promise((resolve, reject) => {
    const data: WellboreTrajectoryPoint[] = [];
    parseString(trajectoryData, { delimiter: ",", headers: true })
      .on("data", (row) => {
        let point: WellboreTrajectoryPoint = {
          md: row["MD"],
          tvd: row["TVD"],
          azimuth: row["AZIMUTH"],
          inclination: row["INCLINATION"],
          latitude: row["LATITUDE"],
          longitude: row["LONGITUDE"],
        };
        data.push(point);
      })
      .on("end", () => {
        resolve(data);
      });
  });
}

/**
 * Return wellbore_trajectory trajectory by a given id
 */
export async function loadWellboreTrajectory(
  wellboreId: string
): Promise<WellboreTrajectoryData> {
  const accessToken = await getAccessToken();
  const datasets = await getDatasetsFromWellboreTrajectory(accessToken);
  const trajectoryDataset = datasets.results[0].data.Datasets[0].slice(0, -1);
  const downloadUrl = await getDownloadUrl(accessToken, trajectoryDataset);
  const trajectoryData = await downloadTrajectory(downloadUrl.SignedUrl);

  const points = await parseTrajectory(trajectoryData);
  return { points: points };
}
