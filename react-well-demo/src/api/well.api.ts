import { handleErrors } from "./handleErrors";
import { getAccessToken } from "./getAccessToken";
import { API_BASE_URL, API_DATA_PARTITION } from "../constants/baseUrl";

export interface FindWellsResponse {
  results: Well[];
}

interface Well {
  id: string;
  data: {
    "SpatialLocation.Wgs84Coordinates": {
      geometries: [
        {
          coordinates: [number, number];
        }
      ];
    };
    FacilityName: string;
  };
}

/**
 * Returns a list of wells, found by a given name
 * no pagination is implemented, results are limited by the backend (99 atm)
 * Error handler is included
 * @param {string} wellName
 */
export async function findWells(): Promise<FindWellsResponse> {
  const accessToken = await getAccessToken();

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "data-partition-id": API_DATA_PARTITION,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      kind: "osdu:wks:master-data--Well:1.1.0",
      limit: 100,
      returnedFields: [
        "id",
        "data.SpatialLocation.Wgs84Coordinates.geometries",
        "data.FacilityName",
      ],
      sort: {"field": ["modifyTime"], "order": ["DESC"]}
    }),
  };
  // query:
  // wellName !== "" ? `id: "osdu:wks:master-data--Well:${wellName}"` : " ",
  return fetch(`${API_BASE_URL}/api/search/v2/query`, requestOptions)
    .then(handleErrors)
    .then((response) => response.json());
}

/**
 * Interface for wellbore_trajectory
 */
interface Wellbore {
  id: string;
  data: {
    FacilityName: string;
  };
}

export interface FindWellboresResponse {
  results: Wellbore[];
}

/**
 * Returns a collection of wellbores for a given well
 * @param wellId
 */
export async function findWellbores(
  wellId: string
): Promise<FindWellboresResponse> {
  const accessToken = await getAccessToken();
  console.log(wellId)
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "data-partition-id": API_DATA_PARTITION,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      kind: "osdu:wks:master-data--Wellbore:1.1.0",
      query: `data.WellID: "${wellId}"`,
      returnedFields: ["id", "data.FacilityName"],
    }),
  };
  return fetch(`${API_BASE_URL}/api/search/v2/query`, requestOptions)
    .then(handleErrors)
    .then((response) => response.json());
}
