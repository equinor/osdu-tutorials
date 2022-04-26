import React, { FC, useState, useEffect } from "react";
import { useWellLog } from "../../hooks/useWelLog";
import WellLogContext from "./context";

type WellLogContextProviderType = {
  children?: React.ReactNode;
}

const WellLogContextProvider: FC<WellLogContextProviderType> = ({ children }) => {
  const {fetchWellLogs, wellLogs} = useWellLog();
  const [selectedWellLog, setSelectedWellLog] = useState<string>("");
  const [selectedWellboreId, setSelectedWellboreId] = useState<string>("");

  useEffect(() => {
    fetchWellLogs(selectedWellboreId);
  }, [selectedWellboreId]);

  return (
    <WellLogContext.Provider
      value={{selectedWellLog, setSelectedWellboreId, setSelectedWellLog}}
    >{children}</WellLogContext.Provider>
  );
};

export default WellLogContextProvider;
