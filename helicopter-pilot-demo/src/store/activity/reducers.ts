import {Activity} from "../../api/activity.api";
import {LOAD_ACTIVITY_FAIL, LOAD_ACTIVITY_START, LOAD_ACTIVITY_SUCCESS, LoadActivityTypes} from "./types";


export interface ActivityLoadState {
    areActivitiesLoading: boolean;
    areActivitiesLoaded: boolean;
    loadError?: Error;
    activities: Activity[];
}

const initialState : ActivityLoadState = {
    areActivitiesLoading: false,
    areActivitiesLoaded: false,
    loadError: undefined,
    activities: []
}

export const activityLoadReducer = (
    state: ActivityLoadState = initialState,
    action: LoadActivityTypes
) : ActivityLoadState => {
    switch (action.type) {
        case LOAD_ACTIVITY_START:
            return {
                ...state,
                areActivitiesLoading: true,
                areActivitiesLoaded: false,
                loadError: undefined
            }
        case LOAD_ACTIVITY_SUCCESS:
            return {
                ...state,
                areActivitiesLoading: false,
                areActivitiesLoaded: true,
                activities: action.payload.results,
            }
        case LOAD_ACTIVITY_FAIL:
            return {
                ...state,
                areActivitiesLoading: false,
                areActivitiesLoaded: false,
                loadError: action.payload
            }
        default:
            return state;
    }
}