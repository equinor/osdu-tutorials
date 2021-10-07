import React, {useState} from "react";
import "./styles.css";

import {Schedule} from "../../api/schedule.api";

export interface ScheduleProps {
    schedule: Schedule;
}

export function FoundSchedule({
    schedule
    }: ScheduleProps) {
    const markClass = ['well__open-mark'].concat('well__open-mark--opened');

    return (
        <div className="schedule">
            <div className="schedule__label-container">
                <label className="schedule__label">
                    <div className="schedule__label-mark">
                        <span className={markClass.join(" ")}/>
                    </div>
                    <span>{schedule.id}</span>
                </label>
            </div>
        </div>
    );
}