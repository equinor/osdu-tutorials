import React, { FC, useState } from "react";
import WellLogContext from "./context";

const WellLogContextProvider: FC = () => {
  const [selectedWellLog, setSelectedWellLog] = useState<string>("");
  return (
    <WellLogContext.Provider
      value={{ wellLog: selectedWellLog }}
    ></WellLogContext.Provider>
  );
};

export default WellLogContextProvider;
