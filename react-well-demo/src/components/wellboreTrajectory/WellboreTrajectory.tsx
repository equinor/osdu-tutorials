import React, { FC, useRef, useEffect } from "react";
import { createTrajectoryChart } from "./createTrajectoryChart";
import "./style.css";
import { WellboreTrajectoryPoint } from "../../hooks/types/trajectory";

type WellboreTrajectoryProps = {
  trajectoryPoints: WellboreTrajectoryPoint[];
};

const WellboreTrajectory: FC<WellboreTrajectoryProps> = ({
  trajectoryPoints,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      createTrajectoryChart(ref.current, trajectoryPoints);
    }
  }, [trajectoryPoints]);

  return (
    <div className="intersection-container">
      <div className="intersection-header">Intersection</div>
      <div className="intersection-root">
        <div ref={ref} className="intersection-layers" />
      </div>
    </div>
  );
};

export default WellboreTrajectory;
