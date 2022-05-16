export type WellLog = {
  results: WellLogResult[];
};

type WellLogResult = {
  data: {
    Datasets: string[];
  };
};

export type WellLogCurve = {
  DEPTH: number;
  GR: number;
};

export type FileGenericType = {
  id: string;
  extension?: string;
};
