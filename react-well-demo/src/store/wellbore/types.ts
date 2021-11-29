import {FindWellboreResponse} from "../../api/welllog.api";

export const FIND_WELLBORE_START = "FIND_WELLBORE_START";
export const FIND_WELLBORE_SUCCESS = "FIND_WELLBORE_SUCCESS";
export const FIND_WELLBORE_FAIL = "FIND_WELLBORE_FAIL";

export interface FindWellboreStartAction {
    type: typeof FIND_WELLBORE_START;
    payload: string;
}

export interface FindWellboreSuccessAction {
    type: typeof FIND_WELLBORE_SUCCESS;
    payload: {
        wellboreId: string;
        results: FindWellboreResponse;
    }
}

export interface FindWellboreFailAction {
    type: typeof FIND_WELLBORE_FAIL;
    payload: {
        err: Error
        wellboreId: string
    }
    };
}

export type WellboreSearchActionTypes =
    | FindWellboreStartAction
    | FindWellboreSuccessAction
    | FindWellboreFailAction;
