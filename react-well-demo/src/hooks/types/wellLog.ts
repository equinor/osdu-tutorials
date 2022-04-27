export type WellLog = {
  results: WellLogResult[];
};

type WellLogResult = {
  data: {
    Datasets: string[];
  };
};
