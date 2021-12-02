import {AppState} from "../index";
import {ThunkAction} from "redux-thunk";
import {FindWellboreResponse, findWellLogDatasetsById} from "../../api/welllog.api";
import {FIND_WELLBORE_TRAJECTORY_START, FIND_WELLBORE_TRAJECTORY_SUCCESS, FIND_WELLBORE_TRAJECTORY_FAIL WellboreTrajectoryLoadActionTypes} from "./types";

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, WellboreSearchActionTypes>;

export function findWellboreTrajectoryStartAction(wellboreId: string): WellboreTrajectoryLoadActionTypes {
    return {
        type: FIND_WELLBORE_TRAJECTORY_START,
        payload: wellboreId,
    }
}

export function findWellboreTrajectorySuccessAction(
    wellboreId: string,
    response: FindWellboreResponse
): WellboreTrajectoryLoadActionTypes {
    return {
        type: FIND_WELLBORE_TRAJECTORY_SUCCESS,
        payload: {
            wellboreId: wellboreId,
            results: response,
        }
    };
}

export function findWellboreTrajectoryFailAction(
    err: Error,
    wellboreId: string
) : WellboreTrajectoryLoadActionTypes {
    return {
        type: FIND_WELLBORE_TRAJECTORY_FAIL,
        payload: {
            err: err,
            wellboreId: wellboreId
        }
    }
}

export const findWellboreByIdAction = (wellboreId: string): AppThunk => dispatch => {
    dispatch(findWellboreStartAction(wellboreId));

    return findWellLogDatasetsById(wellboreId)
        .then(data => dispatch(findWellboreSuccessAction(wellboreId, data)))
        .catch(err => dispatch(findWellboreFailAction(err, wellboreId)));
}
