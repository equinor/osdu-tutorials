import { createContext } from "react";
import { FileGenericType, WellLogCurve } from "../../hooks/types/wellLog";

export type WellLogContextType = {
  selectedWellLog: FileGenericType;
  setSelectedWellLog: (wellLog: FileGenericType) => void;
  setSelectedWellboreId: (id: string) => void;
  selectedWellboreId: string;
  displayWellLogList: boolean;
  setDisplayWellLogList: (display: boolean) => void;
  parquetWellLogCurves: WellLogCurve[];
  lasWellLogCurves: string;
};

const WellLogContext = createContext<WellLogContextType>(
  {} as WellLogContextType
);

export default WellLogContext;
