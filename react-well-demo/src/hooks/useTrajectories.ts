import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellboreType } from "./types/wellbores";

export const useTrajectories = () => {
  const [wellboreType, setWellboreType] = useState<WellboreType>();

  const fetchWellBoreId = async (wellBoreId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": "oaktree-acorn",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind: "osdu:wks:work-product-component--WellboreTrajectory:1.1.0",
        query: `data.WellboreID:(${wellBoreId})`,
        returnedFields: ["id"],
      }),
    };

    try {
      const response = await fetch("/api/search/v2/query", requestOptions).then(
        (response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response;
        }
      );
      const data = (await response.json()) as WellboreType;
      setWellboreType(data);
    } catch (e) {
      console.error(`Error while fetching wells: ${e}`);
    }
  };

  return {
    wellboreType,
    fetchWellBoreId,
  };
};
