import React, { useEffect, useRef } from "react";
import "./welllog.css";
import { createWellLogChart } from "./createWellLogChart";

const WellLog = (props) => {
  const wellLogRef = useRef(null);
  const readout = useRef(null);

  useEffect(() => {
    if (wellLogRef.current && readout.current && props.wellLogCurves) {
      createWellLogChart(
        wellLogRef.current,
        readout.current,
        props.wellLogCurves,
        props.curveTypes
      );
    }
  }, [props.wellLogCurves]);

  if (!props.wellLogCurves || props.wellLogCurves.length === 0) return null;

  return (
    <div className="chart">
      <wellx-welllog ref={wellLogRef} className="wellx" />
      <div ref={readout} className="readout" />
    </div>
  );
};

export default WellLog;
