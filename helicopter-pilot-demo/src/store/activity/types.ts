import {LoadActivityResponse} from "../../api/activity.api";

export const LOAD_ACTIVITY_START = "LOAD_ACTIVITY_START";
export const LOAD_ACTIVITY_SUCCESS = "LOAD_ACTIVITY_SUCCESS";
export const LOAD_ACTIVITY_FAIL = "LOAD_ACTIVITY_FAIL";

export interface LoadActivityStartAction {
    type: typeof LOAD_ACTIVITY_START;
}

export interface LoadActivitySuccessAction {
    type: typeof LOAD_ACTIVITY_SUCCESS;
    payload: LoadActivityResponse;
}

export interface LoadActivityFailAction {
    type: typeof LOAD_ACTIVITY_FAIL;
    payload: Error;
}

export type LoadActivityTypes =
    | LoadActivityStartAction
    | LoadActivitySuccessAction
    | LoadActivityFailAction;
