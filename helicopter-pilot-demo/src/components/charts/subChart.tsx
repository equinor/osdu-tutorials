import "./styles.css";
import React from "react";
import {Bar, CartesianGrid, ComposedChart, Legend, Line, Tooltip, XAxis, YAxis,} from "recharts";
import {useSelector} from "react-redux";
import {AppState} from "../../store";

interface AggregatedActivityData {
    datetime: string,
    max: number,
    Shell: number,
    Equinor: number,
}


/** This chart will aggregate based on destination heliport 
 * When the user clicks a heliport, this subgraph should aggregate based on the heliport they clicked
*/


export function SubChart() {
    const activities = useSelector((state: AppState) => state.activityLoad.activities);
    const activityLoaded = useSelector((state: AppState) => state.activityLoad.areActivitiesLoaded);

    let activityData: AggregatedActivityData[] = [];

    const isEquinor = (senderId: string) => {
        return senderId === "opendes:master-data--Organisation:Equinor:";
    };

    if (activityLoaded) {
        for (const act of activities) {
            const datetime = act.data.EarlyStartDateTime.slice(0, 7);
            let actData = activityData.find(x => x.datetime === datetime)

            const startDate = Date.parse(act.data.EarlyStartDateTime.slice(0, 7));
            const endDate = Date.parse(act.data.EarlyFinishDateTime.slice(0, 7));

            const diffTime = Math.abs(endDate- startDate);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0)
               diffDays = 1;

            const hoursPerday = act.data.AllocatedHours / diffDays;
            const persPerAct = hoursPerday / 12;

            console.log(diffDays, persPerAct)

            if (actData === undefined) {
                actData = {
                    datetime: datetime,
                    max: 18,
                    Shell: isEquinor(act.senderId) ? 0 : persPerAct,
                    Equinor: isEquinor(act.senderId) ? persPerAct : 0
                }
                activityData.push(actData);
            } else {
                if (isEquinor(act.senderId)){
                    actData.Equinor += persPerAct;
                }
                else {
                    actData.Shell += persPerAct;
                }
            }
        }
    }

    return (
        <ComposedChart
            width={1000}
            height={500}
            data={activityData}
            margin={{
                top: 20,
                right: 30,
                left: 100,
                bottom: 5
            }}
        >
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="datetime"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="Shell" stackId="a" fill="#f5c82a"/>
            <Bar dataKey="Equinor" stackId="a" fill="#DC143C"/>
            <Line type="linear" dataKey="max" stroke="#b0b0b0"/>
        </ComposedChart>
    );
}
