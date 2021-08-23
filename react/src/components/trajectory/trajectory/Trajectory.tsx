import React, { useRef, useEffect } from 'react';
import './styles.css';

import { createTrajectoryChart } from 'lib/well-trajectory';
import { TrajectoryToDraw } from 'store/trajectory';

export interface TrajectoryProps {
    trajectoriesToDraw: TrajectoryToDraw[];
}

/**
 * Draws a 3D models of a well's trajectory
 * multiple trajectories can be drawn, layering on each other
 * @param {TrajectoryProps} props
 */
export function Trajectory({ trajectoriesToDraw }: TrajectoryProps) {
    // threejs is not integrated into a react, it just needs a container to renter into
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            createTrajectoryChart(ref.current, trajectoriesToDraw);
        }
    }, [trajectoriesToDraw]);

    return <div className="trajectory" ref={ref}></div>;
}