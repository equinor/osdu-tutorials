import { createContext } from "react";
import { WellLogCurve } from "../../hooks/types/wellLog";

export type WellLogContextType = {
  selectedWellLog: string;
  setSelectedWellLog: (wellLog: string) => void;
  setSelectedWellboreId: (id: string) => void;
  selectedWellboreId: string;
  displayWellLogList: boolean;
  setDisplayWellLogList: (display: boolean) => void;
  wellLogCurves: WellLogCurve[];
};

const WellLogContext = createContext<WellLogContextType>(
  {} as WellLogContextType
);

export default WellLogContext;
