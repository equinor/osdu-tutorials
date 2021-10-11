import {LOAD_SCHEDULES_FAIL, LOAD_SCHEDULES_START, LOAD_SCHEDULES_SUCCESS, LoadSchedulesType} from "./types";
import {ThunkAction} from "redux-thunk";
import {loadSchedules, LoadSchedulesResponse} from "../../api/schedule.api";
import {AppState} from "../index";


type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, LoadSchedulesType>;


export function loadScheduleStartAction(): LoadSchedulesType {
    return {
        type: LOAD_SCHEDULES_START,
    }
}

export function loadSchedulesSuccessAction(response: LoadSchedulesResponse): LoadSchedulesType {
    return {
        type: LOAD_SCHEDULES_SUCCESS,
        payload: response
    }
}

export function loadSchedulesFailAction(err: Error): LoadSchedulesType {
    return {
        type: LOAD_SCHEDULES_FAIL,
        payload: err
    }
}

export const loadSchedulesAction = (heliportId: string = ""): AppThunk => dispatch => {
    dispatch(loadScheduleStartAction());
    return loadSchedules(heliportId)
        .then(data => dispatch(loadSchedulesSuccessAction(data)))
        .catch(err => dispatch(loadSchedulesFailAction(err)));
}