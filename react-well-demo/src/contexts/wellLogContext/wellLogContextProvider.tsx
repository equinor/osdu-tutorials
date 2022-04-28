import React, { FC, useEffect, useState } from "react";
import { useWellLog } from "../../hooks/useWelLog";
import WellLogContext from "./context";

type WellLogContextProviderType = {
  children?: React.ReactNode;
};

const WellLogContextProvider: FC<WellLogContextProviderType> = ({
  children,
}) => {
  const { fetchSignedUri } = useWellLog();
  const [selectedWellLog, setSelectedWellLog] = useState<string>("");
  const [selectedWellboreId, setSelectedWellboreId] = useState<string>("");
  const [displayWellLogList, setDisplayWellLogList] = useState<boolean>(false);

  useEffect(() => {
    if (selectedWellLog !== "") {
      fetchSignedUri(selectedWellLog);
    }
  }, [selectedWellLog]);

  return (
    <WellLogContext.Provider
      value={{
        selectedWellLog,
        setSelectedWellboreId,
        selectedWellboreId,
        setSelectedWellLog,
        displayWellLogList,
        setDisplayWellLogList,
      }}
    >
      {children}
    </WellLogContext.Provider>
  );
};

export default WellLogContextProvider;
