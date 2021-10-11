import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

export interface Schedule {
   id: string;
   data: {
      OriginHeliport: string,
      SenderID: string,
      SchedulingSoftware: string,
      DestinationHeliport: string
   }
}

export interface LoadSchedulesResponse {
   results: Schedule[];
}

export async function loadSchedules(heliportId: string = ""): Promise<LoadSchedulesResponse> {
   const accessToken = await getAccessToken();

   const requestOptions = {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'data-partition-id': 'opendes',
         'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
         "kind": "*:*:work-product-component--HelicopterResourceSchedule:0.0.7",
         "query": heliportId !== "" ? `data.OriginHeliport:("${heliportId}")` : " ",
         "returnedFields": [
            "id",
            "data.OriginHeliport",
            "data.SenderID",
            "data.SchedulingSoftware",
            "data.DestinationHeliport",
         ]
      })
   };

   return fetch("/api/search/v2/query", requestOptions)
      .then(handleErrors)
      .then(response => response.json());
}