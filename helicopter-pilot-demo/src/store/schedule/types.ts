import {LoadSchedulesResponse} from "../../api/schedule.api";

export const LOAD_SCHEDULES_START = "LOAD_SCHEDULES_START";
export const LOAD_SCHEDULES_SUCCESS = "LOAD_SCHEDULES_SUCCESS";
export const LOAD_SCHEDULES_FAIL = "LOAD_SCHEDULES_FAIL";


export interface LoadSchedulesStartAction {
    type: typeof LOAD_SCHEDULES_START;
}

export interface LoadSchedulesSuccessAction {
    type: typeof LOAD_SCHEDULES_SUCCESS;
    payload: LoadSchedulesResponse;
}

export interface LoadSchedulesFailAction {
    type: typeof LOAD_SCHEDULES_FAIL;
    payload: Error;
}

export type LoadSchedulesType =
    | LoadSchedulesStartAction
    | LoadSchedulesSuccessAction
    | LoadSchedulesFailAction;
