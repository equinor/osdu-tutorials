import {LoadHeliportResponse} from "../../api/heliport.api";

export const LOAD_HELIPORTS_START = "LOAD_HELIPORTS_START";
export const LOAD_HELIPORTS_SUCCESS = "LOAD_HELIPORTS_SUCCESS";
export const LOAD_HELIPORTS_FAIL = "LOAD_HELIPORTS_FAIL";


export interface LoadHeliportsStartAction {
    type: typeof LOAD_HELIPORTS_START;
}

export interface LoadHeliportsSuccessAction {
    type: typeof LOAD_HELIPORTS_SUCCESS;
    payload: LoadHeliportResponse;
}

export interface LoadHeliportsFailAction {
    type: typeof LOAD_HELIPORTS_FAIL;
    payload: Error;
}

export type LoadHeliportsType =
    | LoadHeliportsStartAction
    | LoadHeliportsSuccessAction
    | LoadHeliportsFailAction;
