import {LOAD_ACTIVITY_FAIL, LOAD_ACTIVITY_START, LOAD_ACTIVITY_SUCCESS, LoadActivityTypes} from "./types";
import {loadActivities, LoadActivityResponse} from "../../api/activity.api";
import {ThunkAction} from "redux-thunk";
import {AppState} from "../index";

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, LoadActivityTypes>;

export function loadActivitiesStartAction(): LoadActivityTypes {
    return {
        type: LOAD_ACTIVITY_START,
    }
};

export function loadActivitiesSuccessAction(response: LoadActivityResponse): LoadActivityTypes {
    return {
        type: LOAD_ACTIVITY_SUCCESS,
        payload: response,
    }
};

export function loadActivitiesFailAction(err: Error): LoadActivityTypes {
    return {
        type: LOAD_ACTIVITY_FAIL,
        payload: err,
    }
};

export const loadActivitiesAction = (heliportId: string): AppThunk => dispath => {
    dispath(loadActivitiesStartAction());
    return loadActivities(heliportId)
        .then(data => dispath(loadActivitiesSuccessAction(data)))
        .catch(err => dispath(loadActivitiesFailAction(err)));
};