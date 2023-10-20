export type SMDAStatusType = {
  PartitionKey: string;
  RowKey: string;
  workflowId: string;
  runId: string;
  startTimeStamp: number;
  status: string;
  endTimeStamp: number;
};

export type SMDAResponse = {
  wellheaders?: SMDAStatusType[];
  fields?: SMDAStatusType[];
};

export type DDMSStatusType = {
  PartitionKey: string;
  RowKey: string;
  id: string;
  file: string;
  status: string;
  timeStamp: string;
};

export type DDMSResponse = {
  ddmsingestions: DDMSStatusType[];
};
