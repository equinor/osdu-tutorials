import { handleErrors } from './handle-errors';
import {authProvider} from '../authProvider';

export interface FindWellsResponse {
  results: Well[];
}

/* eslint-disable @typescript-eslint/camelcase */
interface Well {
  id: string;
  data: {
    "SpatialLocation.Wgs84Coordinates": {
      geometries: [{
          coordinates: [number, number];
        }
      ]
    };
  }
}
/* eslint-enable @typescript-eslint/camelcase */
const getAccessToken = () => {
  return authProvider.getAccessToken().then(res => res.accessToken);
};

/**
 * Returns a list of wells, found by a given name
 * no pagination is implemented, results are limited by the backend (99 atm)
 * Error handler is included
 * @param {string} wellName
 */
export async function findWellsByName(wellName: string): Promise<FindWellsResponse> {
  const accessToken = await getAccessToken();

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'data-partition-id': 'opendes',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      "kind": "opendes:wks:master-data--Well:1.0.0",
      "limit": 100,
      "query": "",
      "returnedFields": [
        "id",
        "data.SpatialLocation.Wgs84Coordinates.geometries"
      ]
    })
  };

  return fetch("/api/search/v2/query", requestOptions)
    .then(handleErrors)
    .then(response => response.json())
}
