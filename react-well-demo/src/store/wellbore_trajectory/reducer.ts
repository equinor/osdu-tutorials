import {
    LOAD_WELLBORE_TRAJECTORY_FAIL,
    LOAD_WELLBORE_TRAJECTORY_START,
    LOAD_WELLBORE_TRAJECTORY_SUCCESS,
    WellboreTrajectoryActionTypes
} from "./types";
import {WellboreTrajectoryPoint} from "../../api/wellbore_trajectory.api";


export interface WellboreTrajectoryState {
    isWellboreTrajectoryLoading: boolean;

    isWellboreTrajectoryLoaded: boolean;

    loadError?: Error;

    points: WellboreTrajectoryPoint[];
}

const initialState: WellboreTrajectoryState = {
    isWellboreTrajectoryLoading: false,
    isWellboreTrajectoryLoaded: false,
    loadError: undefined,
    points: []
}

export const wellboreTrajectoryReducer = (
    state: WellboreTrajectoryState = initialState,
    action: WellboreTrajectoryActionTypes
) : WellboreTrajectoryState => {
    switch (action.type) {
        case LOAD_WELLBORE_TRAJECTORY_START:
            return {
                ...state,
                isWellboreTrajectoryLoading: true,
                isWellboreTrajectoryLoaded: false,
                loadError: undefined,
                points: []
            };
        case LOAD_WELLBORE_TRAJECTORY_SUCCESS:
            return {
                ...state,
                isWellboreTrajectoryLoading: false,
                isWellboreTrajectoryLoaded: true,
                points: action.payload.results.data.points,
            }
        case LOAD_WELLBORE_TRAJECTORY_FAIL:
            return {
                ...state,
                isWellboreTrajectoryLoading: false,
                isWellboreTrajectoryLoaded: false,
                loadError: action.payload.err
            }
        default:
            return state;
    }
}