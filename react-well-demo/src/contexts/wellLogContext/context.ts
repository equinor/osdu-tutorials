import { createContext } from "react";

export type WellLogContextType = {
  wellLog: string;
};

const WellLogContext = createContext<WellLogContextType>(
  {} as WellLogContextType
);

export default WellLogContext;
