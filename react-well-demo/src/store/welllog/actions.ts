import {LOAD_WELLLOG_FAIL, LOAD_WELLLOG_START, LOAD_WELLLOG_SUCCESS, WellLogActionTypes} from "./types";
import {ThunkAction} from "redux-thunk";
import {AppState} from "../index";
import {WellboreTrajectoryActionTypes} from "../wellbore_trajectory/types";
import {loadWellLogData} from "../../api/welllog.api";

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, WellLogActionTypes>;

export function loadWellLogStartAction(wellboreId: string): WellLogActionTypes {
    return {
        type: LOAD_WELLLOG_START,
        payload: {
            wellboreId
        }
    }
}

export function LoadWellLogSuccessAction(wellboreId: string, response: {}): WellLogActionTypes {
    return {
        type: LOAD_WELLLOG_SUCCESS,
        payload: {
            wellboreId: wellboreId,
            data: response
        }
    }
}

export function LoadWellLogFailAction(err: Error, wellboreId: string): WellLogActionTypes {
    return {
        type: LOAD_WELLLOG_FAIL,
        payload: {
            err: err,
            wellboreId: wellboreId
        }
    }
}

export const loadWellLogDataAction = (wellboreId: string): AppThunk => dispatch => {
   dispatch(loadWellLogStartAction(wellboreId));
   return loadWellLogData(wellboreId)
       .then(data=>dispatch(LoadWellLogSuccessAction(wellboreId, data)))
       .catch(err=>dispatch(LoadWellLogFailAction(err, wellboreId)));
}