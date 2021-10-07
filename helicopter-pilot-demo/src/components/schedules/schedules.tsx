import React from "react";

import {Hint, Loader} from "../shared";
import {AppState} from "../../store";
import {useSelector} from "react-redux";

const noSearchHint = 'Results will be displayed here';
const noDataHint = 'No schedule found';

export function Schedules() {
    const areSchedulesLoading = useSelector((state: AppState) => state.scheduleLoad.areSchedulesLoading);
    const areSchedulesLoaded = useSelector((state: AppState) => state.scheduleLoad.areSchedulesLoaded);
    const loadedSchedules = useSelector((state: AppState) => state.scheduleLoad.schedules);
    const loadingError = useSelector((state: AppState) => state.scheduleLoad.loadError);

    return(
    <>
        <div>
            {areSchedulesLoading ? (
                // progress
                <Loader/>
            ) : loadingError ? (
                <Hint title={noDataHint} subTitle={String(loadingError)}></Hint>
            ) : areSchedulesLoaded ? (
                loadedSchedules.length === 0 ? (
                    <Hint subTitle={noDataHint} />
                ) : (
                    loadedSchedules.map(schedule => (
                        <h1>{schedule.id}</h1>
                    ))
                )
            ) : (
                <Hint subTitle={noSearchHint}/>
            )
            }
        </div>
    </>);
}