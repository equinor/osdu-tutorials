import {AppState} from "../index";
import {ThunkAction} from "redux-thunk";

import {FIND_WELLBORE_FAIL, FIND_WELLBORE_START, FIND_WELLBORE_SUCCESS, WellboreSearchActionTypes} from "./types";
import {FindWellboreResponse, findWellLogDatasetsById} from "../../api/welllog.api";
import {findWellboresFailAction} from "../well/actions";

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, WellboreSearchActionTypes>;

export function findWellboreStartAction(wellboreId: string): WellboreSearchActionTypes {
    return {
        type: FIND_WELLBORE_START,
        payload: wellboreId,
    }
}

export function findWellboreSuccessAction(
    wellboreId: string,
    response: FindWellboreResponse
): WellboreSearchActionTypes {
    return {
        type: FIND_WELLBORE_SUCCESS,
        payload: {
            wellboreId: wellboreId,
            results: response,
        }
    };
}

export function findWellboreFailAction(
    err: Error,
    wellboreId: string
) : WellboreSearchActionTypes {
    return {
        type: FIND_WELLBORE_FAIL,
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
