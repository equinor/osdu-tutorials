import React, { FC, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { createTrajectoryChart } from "./createTrajectoryChart";
import "./style.css";
import { AppState } from "../../store";
import { Trajectory } from "../../hooks/types/trajectory";

type WellboreTrajectoryProps = {
  trajectory: Trajectory;
};

const WellboreTrajectory: FC<WellboreTrajectoryProps> = ({ trajectory }) => {
  const ref = useRef<HTMLDivElement>(null);

  //const trajectory = useSelector((state: AppState) => state.wellboreTrajectory);
  //const loaded = trajectory.isWellboreTrajectoryLoaded;
  console.log("trajectory:");
  console.log(trajectory);
  useEffect(() => {
    if (ref.current) {
      createTrajectoryChart(ref.current, trajectory?.points);
    }
  }, [trajectory]);

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
