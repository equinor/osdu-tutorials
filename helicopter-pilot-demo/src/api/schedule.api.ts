import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

export interface Schedule {
   id: string;
}

export interface LoadSchedulesResponse {
   results: Schedule[];
}

export async function loadSchedules(): Promise<LoadSchedulesResponse> {
   const accessToken = await getAccessToken();

   const requestOptions = {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'data-partition-id': 'opendes',
         'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
         "kind": "*:*:work-product-component--HelicopterResourceSchedule:*",
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