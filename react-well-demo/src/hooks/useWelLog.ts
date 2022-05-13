import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { WellLog, WellLogCurve } from "../hooks/types/wellLog";

export const useWellLog = () => {
  const [fileGenericIds, setFileGenericIds] = useState<string[]>([]);
  const [fileGenericIdsLoading, setFileGenericIdsLoading] =
    useState<boolean>(false);
  const [wellLogCurves, setWellLogCurves] = useState<WellLogCurve[]>([]);
  const [error, setError] = useState<Error>();

  var parquet = require("parquetjs-lite");
  var request = require("request");

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
      const response = await fetch("/api/search/v2/query", requestOptions).then(
        (response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response;
        }
      );
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

  const fetchSignedUri = async (fileGenericId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const url = `/api/file/v2/files/${fileGenericId}/downloadURL`;
    const requestOptions = {
      method: "GET",
      headers: {
        "data-partition-id": "oaktree-acorn",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    try {
      const response = await fetch(url, requestOptions).then((response) => {
        if (!response.ok) {
          console.log(response.statusText);
          throw new Error(response.statusText);
        }
        return response;
      });
      const signedUrl = (await response.json()).SignedUrl as string;

      fetchCurves(signedUrl);
    } catch (e) {
      console.error(`Error when fetching signedUri: ${e}`);
    }
  };

  const fetchCurves = async (signedUrl: string): Promise<void> => {
    try {
      var reader = await parquet.ParquetReader.openUrl(request, signedUrl);
      var record = null;
      var cursor = reader.getCursor();
      const curveArray: WellLogCurve[] = [];
      while ((record = await cursor.next())) {
        curveArray.push(record);
      }
      reader.close();
      setWellLogCurves(curveArray);
    } catch (e) {
      console.error(`Error when fetching curves: ${e}`);
      setError(e as Error);
    }
  };

  return {
    fileGenericIds,
    fetchFileGenericIds,
    fetchSignedUri,
    fileGenericIdsLoading,
    fetchCurves,
    wellLogCurves,
    error,
  };
};
