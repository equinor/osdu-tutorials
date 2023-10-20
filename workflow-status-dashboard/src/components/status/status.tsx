import React, { FC } from "react";
import { DDMSStatusType, SMDAStatusType } from "../../types/status";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "./styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import SmdaStatus from "./smdaStatus";
import DdmsStatus from "./ddmsStatus";

type StatusProps = {
  smdaStatus?: SMDAStatusType[];
  ddmsStatus?: DDMSStatusType[];
};

const Status: FC<StatusProps> = ({ smdaStatus, ddmsStatus }) => {
  if (!smdaStatus && !ddmsStatus) {
    return (
      <SkeletonTheme>
        <table>
          <Skeleton count={8} />
        </table>
      </SkeletonTheme>
    );
  }

  const checkStatus = (status: string): string => {
    if (status === "finished") {
      return "tableRow_finished";
    } else if (status === "failed") {
      return "tableRow_failed";
    } else if (status === "running") {
      return "tableRow_running";
    }
    return "tableRow";
  };

  const unixTimeStampToDate = (timeStamp: number) => {
    return (
      new Date(timeStamp).toLocaleDateString("no") +
      " " +
      new Date(timeStamp).toLocaleTimeString("no")
    );
  };

  return (
    <div>
      {smdaStatus && (
        <SmdaStatus
          status={smdaStatus}
          unixTimeStampToDate={unixTimeStampToDate}
          checkStatus={checkStatus}
        />
      )}

      {ddmsStatus && (
        <DdmsStatus
          status={ddmsStatus}
          unixTimeStampToDate={unixTimeStampToDate}
          checkStatus={checkStatus}
        />
      )}
    </div>
  );
};

export default Status;
