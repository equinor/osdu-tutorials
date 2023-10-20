import React, { FC } from "react";
import { DDMSStatusType } from "../../types/status";

type DdmsStatusProps = {
  status: DDMSStatusType[];
  unixTimeStampToDate: (timeStamp: number) => string;
  checkStatus: (status: string) => string;
};

const DdmsStatus: FC<DdmsStatusProps> = ({
  status,
  unixTimeStampToDate,
  checkStatus,
}) => {
  return (
    <div className="status-container">
      <table>
        <tr>
          <th>Partition key</th>
          <th>Row Id</th>
          <th>File</th>
          <th>Id</th>
          <th>Status</th>
          <th>Run timestamp</th>
        </tr>

        {status.map((s) => {
          return (
            <tr key={`ddms__${s.id}`} className={checkStatus(s.status)}>
              <td style={{ width: "250px" }}>{s.PartitionKey}</td>
              <td>{s.RowKey}</td>
              <td>{s.file}</td>
              <td>{s.id}</td>
              <td>{s.status}</td>
              <td>{unixTimeStampToDate(+s.timeStamp)}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default DdmsStatus;
