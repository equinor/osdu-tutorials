import React, { useEffect, useRef } from "react";
import "./welllog.css";
import { createWellLogChart } from "./createWellLogChart";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";

const WellLog = () => {
  const { wellLogCurves } = useWellLogContext();
  const wellLogRef = useRef(null);
  const readout = useRef(null);

  useEffect(() => {
    if (wellLogRef.current && readout.current) {
      createWellLogChart(wellLogRef.current, readout.current, wellLogCurves);
    }
  }, [wellLogCurves]);

  if (wellLogCurves.length === 0) return null;

  return (
    <div className="chart">
      <wellx-welllog ref={wellLogRef} />
      <div ref={readout} />
    </div>
  );
};

export default WellLog;
