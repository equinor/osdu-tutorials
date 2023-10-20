import React, { FC } from "react";
import { SMDAStatusType } from "../../types/status";
import "./styles.css";
import "react-loading-skeleton/dist/skeleton.css";

type SmdaStatusProps = {
  status: SMDAStatusType[];
  unixTimeStampToDate: (timeStamp: number) => string;
  checkStatus: (status: string) => string;
};

const SmdaStatus: FC<SmdaStatusProps> = ({
  status,
  unixTimeStampToDate,
  checkStatus,
}) => {
  return (
    <div className="status-container">
      <table>
        <tr>
          <th>Partition key</th>
          <th>Workflow Id</th>
          <th>Status</th>
          <th>Job started</th>
          <th>Job ended</th>
          <th>Run Id</th>
        </tr>

        {status.map((s) => {
          return (
            <tr key={`tableRow__${s.runId}`} className={checkStatus(s.status)}>
              <td style={{ width: "250px" }}>{s.PartitionKey}</td>
              <td>{s.workflowId}</td>
              <td>{s.status}</td>
              <td>{unixTimeStampToDate(s.startTimeStamp)}</td>
              <td>{unixTimeStampToDate(s.endTimeStamp)}</td>
              <td>{s.runId}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default SmdaStatus;
