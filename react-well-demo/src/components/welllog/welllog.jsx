import React, {useEffect, useRef} from "react";
import "./welllog.css"
import {createWellLogChart} from "./createWellLogChart";
import {useSelector} from "react-redux";

export default function WellLog() {
    const wellLog = useRef(null);
    const readout = useRef(null);

    const wellLogState = useSelector(state => state.wellLogState);

    console.log("welllog data ", wellLogState.data);

    useEffect(() => {
        if (wellLog.current && readout.current) {
            createWellLogChart(wellLog.current, readout.current, wellLogState.data);
        }
    }, [wellLogState]);

    if (wellLogState.isLoaded === false)
        return <dev/>;

    return (
        <div className="chart">
            <wellx-welllog ref={wellLog}></wellx-welllog>
            <div class="readout" ref={readout}></div>
        </div>
    );
}