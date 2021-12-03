import {AppState} from "../index";
import {ThunkAction} from "redux-thunk";
import {LOAD_WELLBORE_TRAJECTORY_START, LOAD_WELLBORE_TRAJECTORY_SUCCESS, LOAD_WELLBORE_TRAJECTORY_FAIL, WellboreTrajectoryActionTypes} from "./types";
import {
    loadWellboreTrajectory,
    WellboreTrajectoryData
} from "../../api/wellbore_trajectory.api";

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, WellboreTrajectoryActionTypes>;

export function loadWellboreTrajectoryStartAction(wellboreId: string): WellboreTrajectoryActionTypes {
    return {
        type: LOAD_WELLBORE_TRAJECTORY_START,
        payload: {
            wellboreId
        },
    }
}

export function loadWellboreTrajectorySuccessAction(
    wellboreId: string,
    response: WellboreTrajectoryData
): WellboreTrajectoryActionTypes {
    return {
        type: LOAD_WELLBORE_TRAJECTORY_SUCCESS,
        payload: {
            wellboreId: wellboreId,
            results: response
        }
    };
}

export function loadWellboreTrajectoryFailAction(
    err: Error,
    wellboreId: string
) : WellboreTrajectoryActionTypes {
    return {
        type: LOAD_WELLBORE_TRAJECTORY_FAIL,
        payload: {
            err: err,
            wellboreId: wellboreId
        }
    }
}

export const loadWellboreTrajectoryAction = (wellboreId: string): AppThunk => dispatch => {
    dispatch(loadWellboreTrajectoryStartAction(wellboreId));

    return loadWellboreTrajectory(wellboreId)
        .then(data => dispatch(loadWellboreTrajectorySuccessAction(wellboreId, data)))
        .catch(err => dispatch(loadWellboreTrajectoryFailAction(err, wellboreId)));
}
