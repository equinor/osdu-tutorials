import { useState } from "react";
import { getAccessToken } from "../api/getAccessToken";
import { FileGenericType, WellLog, WellLogCurve } from "../hooks/types/wellLog";
import {
  NPEQUINOR_BASE_URL,
  NPEQUINOR_DATA_PARTITION,
} from "../constants/baseUrl";

export const useWellLog = () => {
  const [fileGenerics, setFileGenerics] = useState<FileGenericType[]>([]);
  const [fileGenericIdsLoading, setFileGenericIdsLoading] =
    useState<boolean>(false);
  const [parquetWellLogCurves, setParquetWellLogCurves] = useState<
    WellLogCurve[]
  >([]);
  const [lasWellLogCurves, setLasWellLogCurves] = useState<string>("");
  const [error, setError] = useState<Error>();

  var parquet = require("parquetjs-lite");
  var request = require("request");

  type PreloadFilePath = {
    "DatasetProperties.FileSourceInfo.PreloadFilePath": string;
  };

  enum FileExtensionEnum {
    PARQUET = "PARQUET",
    LIS = "LIS",
    DLIS = "DLIS",
    LAS = "LAS",
  }

  const fetchFileType = async (
    fileGenericId: string
  ): Promise<string | undefined> => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": `${NPEQUINOR_DATA_PARTITION}`,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        kind: "osdu:wks:dataset--File.Generic:1.0.0",
        query: `id:(\"${fileGenericId}\")`,
        returnedFields: [
          "data.DatasetProperties.FileSourceInfo.PreloadFilePath",
        ],
      }),
    };
    try {
      const response = await fetch(
        `${NPEQUINOR_BASE_URL}/api/search/v2/query`,
        requestOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });
      const data = await response.json();

      // Take file extension from preloadFilePath and return to caller
      const filePath = data.results[0].data as PreloadFilePath;
      const extension = filePath[
        "DatasetProperties.FileSourceInfo.PreloadFilePath"
      ]
        .split(".")
        .pop();
      return extension?.toUpperCase();
    } catch (e) {
      console.error(`Error when fetching preloadFileType: ${e}`);
    }
    return undefined;
  };

  const fetchFileGenericIds = async (wellboreId: string): Promise<void> => {
    const accessToken = await getAccessToken();
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "data-partition-id": `${NPEQUINOR_DATA_PARTITION}`,
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
        `${NPEQUINOR_BASE_URL}/api/search/v2/query`,
        requestOptions
      ).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      });

      const data = (await response.json()) as WellLog;

      // Map out FileGenericIds and trim off colon at the end of Id
      const mappedIds = data.results.map((fileGenericId) => {
        let id = fileGenericId.data.Datasets[0];
        const trimmedFileGenericId = id.substring(0, id.length - 1);
        return trimmedFileGenericId;
      });

      // Fetch file extensions from preloadFilePath and append to composite object
      const compositeFileGenerics = await Promise.all(
        mappedIds.map(async (id) => {
          const type = await fetchFileType(id);
          return { id: id, extension: type } as FileGenericType;
        })
      );
      setFileGenerics(compositeFileGenerics);
      setFileGenericIdsLoading(false);
    } catch (e) {
      console.error(`Error when fetching wellLogId: ${e}`);
    }
  };

  const fetchSignedUri = async (
    fileGenericId: string,
    extension: string
  ): Promise<void> => {
    const accessToken = await getAccessToken();
    const url = `/api/file/v2/files/${fileGenericId}/downloadURL`;
    const requestOptions = {
      method: "GET",
      headers: {
        "data-partition-id": `${NPEQUINOR_DATA_PARTITION}`,
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

      if (extension === FileExtensionEnum.PARQUET) {
        fetchParquetCurves(signedUrl);
      } else {
        fetchCurves(signedUrl);
      }
    } catch (e) {
      console.error(`Error when fetching signedUri: ${e}`);
    }
  };

  const fetchParquetCurves = async (signedUrl: string): Promise<void> => {
    try {
      var reader = await parquet.ParquetReader.openUrl(request, signedUrl);
      var record = null;
      var cursor = reader.getCursor();
      const curveArray: WellLogCurve[] = [];
      while ((record = await cursor.next())) {
        curveArray.push(record);
      }
      reader.close();
      setParquetWellLogCurves(curveArray);
    } catch (e) {
      console.error(`Error when fetching parquet curves: ${e}`);
      setError(e as Error);
    }
  };

  const fetchCurves = async (signedUrl: string): Promise<void> => {
    try {
      const response = await fetch(signedUrl).then((response) => {
        if (!response.ok) {
          console.log(response.statusText);
          throw new Error(response.statusText);
        }
        return response;
      });
      const data = (await response.text()) as string;
      setLasWellLogCurves(data);
    } catch (e) {
      console.error(`Error when fetching curves: ${e}`);
      setError(e as Error);
    }
  };

  return {
    fileGenerics,
    fetchFileGenericIds,
    fetchSignedUri,
    fileGenericIdsLoading,
    fetchParquetCurves,
    parquetWellLogCurves,
    lasWellLogCurves,
    error,
  };
};
