export const LOAD_WELLLOG_START = "LOAD_WELLLOG_START";
export const LOAD_WELLLOG_SUCCESS = "LOAD_WELLLOG_SUCCESS";
export const LOAD_WELLLOG_FAIL = "LOAD_WELLLOG_FAIL";

export interface LoadWellLogStartAction {
    type: typeof LOAD_WELLLOG_START,
    payload: {
        wellboreId: string
    }
}

export interface LoadWellLogSuccessAction {
    type: typeof LOAD_WELLLOG_SUCCESS,
    payload: {
        wellboreId: string;
        data: {}
    }
}

export interface LoadWellLogFailAction {
    type: typeof LOAD_WELLLOG_FAIL,
    payload: {
        err: Error,
        wellboreId: string
    }
}

export type WellLogActionTypes =
    | LoadWellLogStartAction
    | LoadWellLogSuccessAction
    | LoadWellLogFailAction;