import React, { FC, useEffect, useRef } from "react";
import "./welllog.css";
import { createWellLogChart } from "./createWellLogChart";
import { useWellLogContext } from "../../contexts/wellLogContext/useWellLogContext";

const WellLog: FC = () => {
  const { wellLogCurves } = useWellLogContext();
  const wellLogRef = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);

  console.log(wellLogCurves, wellLogRef);

  useEffect(() => {
    if (wellLogRef.current && readout.current) {
      createWellLogChart(wellLogRef.current, readout.current, wellLogCurves);
    }
  }, [wellLogCurves]);

  if (wellLogCurves.length === 0) return null;

  return (
    <div className="chart">
      <div ref={wellLogRef} />
      <div ref={readout} />
    </div>
  );
};

export default WellLog;
