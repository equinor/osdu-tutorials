import { useState, useEffect } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellLog } from "../hooks/types/wellLog";
import { API_BASE_URL } from "../constants/baseUrl";

export const useWellLog = () => {
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
    } catch (e) {
      console.error(`Error when fetching wellLogId: ${e}`);
    }
  };

  const fetchCurves = async (wellLogId: string): Promise<void> => {
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
      const data = await response.json();
    } catch (e) {
      console.error(`Error when fetching curves: ${e}`);
    }
  };

  return {
    wellLogs,
    fetchWellLogs,
  };
};
