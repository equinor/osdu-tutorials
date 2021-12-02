import {LoadWellboreTrajectoryResponse} from "../../api/wellbore_trajectory.api";

export const LOAD_WELLBORE_TRAJECTORY_START = "LOAD_WELLBORE_TRAJECTORY_START";
export const LOAD_WELLBORE_TRAJECTORY_SUCCESS = "LOAD_WELLBORE_TRAJECTORY_SUCCESS";
export const LOAD_WELLBORE_TRAJECTORY_FAIL = "LOAD_WELLBORE_TRAJECTORY_FAIL";

export interface LoadWellboreTrajectoryStartAction {
    type: typeof LOAD_WELLBORE_TRAJECTORY_START;
    payload: {
        wellboreId: string
    };
}

export interface LoadWellboreTrajectorySuccessAction {
    type: typeof LOAD_WELLBORE_TRAJECTORY_SUCCESS;
    payload: {
        wellboreId: string;
        results: LoadWellboreTrajectoryResponse;
    }
}

export interface LoadWellboreTrajectoryFailAction {
    type: typeof LOAD_WELLBORE_TRAJECTORY_FAIL;
    payload: {
        err: Error
        wellboreId: string
    }
}

export type WellboreTrajectoryActionTypes =
    | LoadWellboreTrajectoryStartAction
    | LoadWellboreTrajectorySuccessAction
    | LoadWellboreTrajectoryFailAction;
