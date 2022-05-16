import React, { FC, useEffect, useState } from "react";
import { FileGenericType } from "../../hooks/types/wellLog";
import { useWellLog } from "../../hooks/useWelLog";
import WellLogContext from "./context";

type WellLogContextProviderType = {
  children?: React.ReactNode;
};

const WellLogContextProvider: FC<WellLogContextProviderType> = ({
  children,
}) => {
  const { fetchSignedUri, parquetWellLogCurves, lasWellLogCurves } =
    useWellLog();
  const [selectedWellLog, setSelectedWellLog] = useState<FileGenericType>(
    {} as FileGenericType
  );
  const [selectedWellboreId, setSelectedWellboreId] = useState<string>("");
  const [displayWellLogList, setDisplayWellLogList] = useState<boolean>(false);

  useEffect(() => {
    if (selectedWellLog) {
      fetchSignedUri(selectedWellLog.id, selectedWellLog.extension);
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
        parquetWellLogCurves,
        lasWellLogCurves,
      }}
    >
      {children}
    </WellLogContext.Provider>
  );
};

export default WellLogContextProvider;
