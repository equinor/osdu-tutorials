import React, { useEffect, useRef } from "react";
import "./welllog.css";
import { createWellLogChart } from "./createWellLogChart";
import { useSelector } from "react-redux";

export default function WellLog() {
  const wellLogRef = useRef(null);
  const readout = useRef(null);

  const wellLogState = useSelector((state) => state.wellLogState);

  useEffect(() => {
    console.log("render...");
    if (wellLogRef.current && readout.current) {
      createWellLogChart(
        wellLogRef.current,
        readout.current,
        wellLogState.data.data
      );
    }
  }, [wellLogState]);

  if (wellLogState.isWellLogLoaded == false) return <div />;

  return (
    <div className="chart">
      <wellx-welllog ref={wellLogRef}></wellx-welllog>
      <div class="readout" ref={readout}></div>
    </div>
  );
}
