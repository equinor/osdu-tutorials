import { createContext } from "react";

export type WellLogContextType = {
  selectedWellLog: string;
  setSelectedWellLog: (wellLog: string) => void;
  setSelectedWellboreId: (id: string) => void;
};

const WellLogContext = createContext<WellLogContextType>(
  {} as WellLogContextType
);

export default WellLogContext;
