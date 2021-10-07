import {Schedule} from "../../api/schedule.api";
import {LOAD_SCHEDULES_FAIL, LOAD_SCHEDULES_START, LOAD_SCHEDULES_SUCCESS, LoadSchedulesType} from "./types";

export interface ScheduleLoadState {
    areSchedulesLoading: boolean;
    areSchedulesLoaded: boolean;
    loadError?: Error;
    schedules: Schedule[];
};

const initialState : ScheduleLoadState = {
    areSchedulesLoading: false,
    areSchedulesLoaded: false,
    schedules: [],
    loadError: undefined,
};

export const scheduleLoadReducer = (
    state: ScheduleLoadState = initialState,
    action: LoadSchedulesType
) : ScheduleLoadState => {
    switch (action.type) {
        case LOAD_SCHEDULES_START:
            return {
                ...state,
                areSchedulesLoading: true,
                areSchedulesLoaded: false,
                loadError: undefined
            };
        case LOAD_SCHEDULES_SUCCESS:
            return {
                ...state,
                areSchedulesLoading: false,
                areSchedulesLoaded: true,
                schedules: action.payload.results,
            };
        case LOAD_SCHEDULES_FAIL:
            return {
                ...state,
                areSchedulesLoading: false,
                areSchedulesLoaded: false,
                loadError: action.payload,
            };
        default:
            return state;
    }
}