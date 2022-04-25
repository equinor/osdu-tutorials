import { useContext } from "react";
import WellLogContext, { WellLogContextType } from "./context";

export const useWellLogContext = (): WellLogContextType => {
  const useWellLog = useContext(WellLogContext);
  return useWellLog;
};
