import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellboreType } from "./types/wellbores";
import { API_BASE_URL, API_DATA_PARTITION } from "../constants/baseUrl";
import { Trajectory, WellboreTrajectoryPoint } from "./types/trajectory";

export const useTrajectories = () => {
  const [wellboreType, setWellboreType] = useState<WellboreType>();
  const [trajectories, setTrajectories] = useState<WellboreTrajectoryPoint[]>(
    []
  );

  const fetchWellBoreId = async (wellBoreId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": API_DATA_PARTITION,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind: "osdu:wks:work-product-component--WellboreTrajectory:1.1.0",
        query: `data.WellboreID:(\"${wellBoreId}\")`,
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
      const data = (await response.json()) as WellboreType;
      setWellboreType(data);
    } catch (e) {
      console.error(`Error while fetching wells: ${e}`);
    }
  };

  const fetchTrajectories = async (trajectoryId: string) => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": API_DATA_PARTITION,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/storage/v2/records/${trajectoryId}`,
        requestOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      const data = (await response.json()) as Trajectory;
      setTrajectories(data?.data?.ExtensionProperties?.trajectory);
    } catch (e) {
      console.error(`Error while fetching wells: ${e}`);
    }
  };

  return {
    wellboreType,
    trajectories,
    fetchWellBoreId,
    fetchTrajectories,
  };
};
