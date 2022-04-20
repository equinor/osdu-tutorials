export type WellLog = {
  id: string;
  data: WellLogData;
};

type WellLogData = {
  DataSets: string[];
};
