import React, {useRef, useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {createTrajectoryChart} from "./createTrajectoryChart";
import "./style.css";
import {AppState} from "../../store";

export function WellboreTrajectory() {
    const ref = useRef<HTMLDivElement>(null);

    const trajectory = useSelector((state: AppState) => state.wellboreTrajectory)
    const loaded = trajectory.isWellboreTrajectoryLoaded;

    useEffect(() => {
        if (ref.current) {
            createTrajectoryChart(ref.current, trajectory.points);
        }
    }, [trajectory]);

    if (loaded === false) {
        return <div/>
    }

    return (
        <div className="intersection-container">
            <div className="intersection-header">Intersection</div>
            <div className="intersection-root">
                <div ref={ref} className="intersection-layers"/>
            </div>
        </div>
    );
}