import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellLog } from "../hooks/types/wellLog";
import { API_BASE_URL } from "../constants/baseUrl";

export const useWellLog = () => {
  var parquet = require("parquetjs-lite");
  const [wellLogs, setWellLogs] = useState<WellLog[]>([]);

  const fetchWellLogs = async (wellboreId: string): Promise<void> => {
    const accessToken = getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": "oaktree-acorn",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind: "osdu:wks:work-product-component--Welllog:1.0.0",
        query: `data.WellboreID:(\"${wellboreId}\")`,
        returnedFields: ["id"],
      }),
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search/v2/query`,
        requestOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      const data = (await response.json()) as WellLog[];
      setWellLogs(data);
      fetchSignedUri(data[0].id);
    } catch (e) {
      console.error(`Error when fetching wellLogId: ${e}`);
    }
  };

  const fetchSignedUri = async (wellLogId: string): Promise<void> => {
    const accessToken = getAccessToken();
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
      console.log(response);
    } catch (e) {
      console.error(`Error when fetching curves: ${e}`);
    }
  };

  return {
    wellLogs,
    fetchWellLogs,
  };
};
