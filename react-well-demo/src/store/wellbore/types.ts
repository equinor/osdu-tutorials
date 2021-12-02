import {FindWellboreResponse} from "../../api/welllog.api";

export const FIND_WELLBORE_TRAJECTORY_START = "FIND_WELLBORE_START";
export const FIND_WELLBORE_TRAJECTORY_SUCCESS = "FIND_WELLBORE_SUCCESS";
export const FIND_WELLBORE_TRAJECTORY_FAIL = "FIND_WELLBORE_FAIL";

export interface FindWellboreTrajectoryStartAction {
    type: typeof FIND_WELLBORE_TRAJECTORY_START;
    payload: string;
}

export interface FindWellboreTrajectorySuccessAction {
    type: typeof FIND_WELLBORE_TRAJECTORY_SUCCESS;
    payload: {
        wellboreId: string;
        results: FindWellboreResponse;
    }
}

export interface FindWellboreTrajectoryFailAction {
    type: typeof FIND_WELLBORE_TRAJECTORY_FAIL;
    payload: {
        err: Error
        wellboreId: string
    }
}

export type WellboreTrajectoryLoadActionTypes =
    | FindWellboreTrajectoryStartAction
    | FindWellboreTrajectorySuccessAction
    | FindWellboreTrajectoryFailAction;
