import {
    FIND_WELLBORE_START,
    FIND_WELLBORE_SUCCESS,
    FIND_WELLBORE_FAIL, WellboreSearchActionTypes
} from "./types";

export interface WellboreLoadState {
    isWellboreLoading: boolean;

    isWellboreLoaded: boolean;

    loadError?: Error;

    datasets: []
}

const initialState: WellboreLoadState = {
    isWellboreLoading: false,
    isWellboreLoaded: false,
    loadError: undefined,
    datasets: []
}

export const wellboreLoadReducer = (
    state: WellboreLoadState = initialState,
    action: WellboreSearchActionTypes
) : WellboreLoadState => {
    switch (action.type) {
        default:
            return state;
    }
}