import {LOAD_HELIPORTS_FAIL, LOAD_HELIPORTS_START, LOAD_HELIPORTS_SUCCESS, LoadHeliportsType} from "./types";
import {Heliport} from "../../api/heliport.api";

export interface HeliportLoadState {
    areHeliportsLoading: boolean;
    areHeliportsLoaded: boolean;
    loadError?: Error;
    heliports: Heliport[];
};

const initialState : HeliportLoadState = {
    areHeliportsLoading: false,
    areHeliportsLoaded: false,
    heliports: [],
    loadError: undefined,
};

export const heliportLoadReducer = (
    state: HeliportLoadState = initialState,
    action: LoadHeliportsType
) : HeliportLoadState => {
    switch (action.type) {
        case LOAD_HELIPORTS_START:
            return {
                ...state,
                areHeliportsLoading: true,
                areHeliportsLoaded: false,
                loadError: undefined
            };
        case LOAD_HELIPORTS_SUCCESS:
            return {
                ...state,
                areHeliportsLoading: false,
                areHeliportsLoaded: true,
                heliports: action.payload.results,
            };
        case LOAD_HELIPORTS_FAIL:
            return {
                ...state,
                areHeliportsLoading: false,
                areHeliportsLoaded: false,
                loadError: action.payload,
            };
        default:
            return state;
    }
}