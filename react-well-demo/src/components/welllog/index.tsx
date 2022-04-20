import React, { FC, useEffect, useRef } from "react";
import "./welllog.css";
import { createWellLogChart } from "./createWellLogChart";
import { useSelector } from "react-redux";
import { AppState } from "../../store";

const WellLog: FC = () => {
  const wellLogRef = useRef(null);
  const readout = useRef(null);

  const wellLogState = useSelector((state: AppState) => state.wellLogState);
  console.log("rendered");

  useEffect(() => {
    if (wellLogRef.current && readout.current) {
      createWellLogChart(
        wellLogRef.current,
        readout.current,
        wellLogState?.data
      );
    }
  }, [wellLogState]);

  console.log(wellLogState);

  if (wellLogState.isWellLogLoaded === false) return <div />;

  return (
    <div className="chart">
      {/* <wellx-welllog ref={wellLogRef}></wellx-welllog> */}
      <div ref={wellLogRef}></div>
      <div className="readout" ref={readout}></div>
    </div>
  );
};

export default WellLog;
