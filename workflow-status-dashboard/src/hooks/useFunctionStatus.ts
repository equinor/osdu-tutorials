import { useState } from "react";
import { DDMSResponse, SMDAResponse } from "../types/status";
import {
  DDMS_COMPOSITE_WELLOG_BASE_URL,
  SMDA_INGESTION_BASE_URL,
} from "../constants/baseUrls";

const headers = {
  headers: {
    "Content-type": "application/json",
  },
};

export const useFunctionStatus = () => {
  const [smdaStatus, setSmdaStatus] = useState<SMDAResponse>(
    {} as SMDAResponse
  );
  const [ddmsStatus, setDdmsStatus] = useState<DDMSResponse>(
    {} as DDMSResponse
  );

  const fetchSmdaStatus = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${SMDA_INGESTION_BASE_URL}/api/lastrunshttptrigger?code=g4CCCl4Rp5tIssO43ne0EkF2ikxQPJaqGbyUXFIszNVRAzFuVS0Rug==`,
        headers
      ).then((response) => {
        if (!response.status) {
          throw new Error();
        }
        return response;
      });
      const data = (await response.json()) as SMDAResponse;
      setSmdaStatus(data);
    } catch (e) {
      console.error(`Error when fetching SMDA airflow statuses`);
    }
  };

  const fetchDdmsCompositeWellogStatus = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${DDMS_COMPOSITE_WELLOG_BASE_URL}/api/lastrunshttptrigger?code=r_kHYRuGtb6aflvTbzyWxqU5A9EdiAlEXWMoJuVLXPxWAzFu0JFQBA==&days_ago=1`,
        headers
      ).then((response) => {
        if (!response.status) {
          throw new Error();
        }
        return response;
      });
      const data = (await response.json()) as DDMSResponse;
      setDdmsStatus(data);
    } catch (e) {
      console.error(`Error when fetching DDMS composite wellog statuses: ${e}`);
    }
  };

  return {
    fetchSmdaStatus,
    smdaStatus,
    ddmsStatus,
    fetchDdmsCompositeWellogStatus,
  };
};
