import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellLog } from "../hooks/types/wellLog";
import { API_BASE_URL } from "../constants/baseUrl";

export const useWellLog = () => {
  var parquet = require("parquetjs-lite");
  const [fileGenericIds, setFileGenericIds] = useState<string[]>([]);
  const [fileGenericIdsLoading, setFileGenericIdsLoading] =
    useState<boolean>(false);

  const fetchFileGenericIds = async (wellboreId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": "oaktree-acorn",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind: "osdu:wks:work-product-component--WellLog:1.1.0",
        query: `data.WellboreID:(\"${wellboreId}\")`,
        returnedFields: ["data.Datasets"],
      }),
    };
    try {
      setFileGenericIdsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/search/v2/query`,
        requestOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      setFileGenericIdsLoading(false);
      const data = (await response.json()) as WellLog;

      // Map out FileGenericIds and trim off colon at the end of Id
      const mappedIds = data.results.map((fileGenericId) => {
        let id = fileGenericId.data.Datasets[0];
        const trimmedFileGenericId = id.substring(0, id.length - 1);
        return trimmedFileGenericId;
      });
      setFileGenericIds(mappedIds);
    } catch (e) {
      console.error(`Error when fetching wellLogId: ${e}`);
    }
  };

  const fetchSignedUri = async (wellLogId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const ddmsUrl = `${API_BASE_URL}/api/os-wellbore-ddms/ddms/v3/welllogs/${wellLogId}/data?curves=DEPTH,GR`;
    const requestOptions = {
      method: "GET",
      headers: {
        "data-partition-id": "oaktree-acorn",
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    };
    try {
      const response = await fetch(ddmsUrl, requestOptions).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      const signedUri = (await response.json()) as string;
      fetchCurves(signedUri);
    } catch (e) {
      console.error(`Error when fetching signedUri: ${e}`);
    }
  };

  const fetchCurves = async (signedURI: string): Promise<void> => {
    const requestOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    };
    try {
      const response = await parquet.ParquetReader.openUrl(
        fetch,
        signedURI,
        requestOptions
      ).then((response: Response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      console.log("PARQUET", response);
    } catch (e) {
      console.error(`Error when fetching curves: ${e}`);
    }
  };

  return {
    fileGenericIds,
    fetchFileGenericIds,
    fetchSignedUri,
    fileGenericIdsLoading,
  };
};
