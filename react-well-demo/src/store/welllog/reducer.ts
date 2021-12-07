import {LOAD_WELLLOG_FAIL, LOAD_WELLLOG_START, LOAD_WELLLOG_SUCCESS, WellLogActionTypes} from "./types";


export interface WellLogState {
    isWellLogLoading: boolean,
    isWellLogLoaded: boolean,
    loadError?: Error,
    data?: {}
}

const initialState: WellLogState = {
    isWellLogLoading: false,
    isWellLogLoaded: false,
    loadError: undefined,
    data: undefined
}

export const wellLogReducer = (
    state: WellLogState = initialState,
    action: WellLogActionTypes
) : WellLogState => {
    switch (action.type) {
        case LOAD_WELLLOG_START:
            return {
                ...state,
                isWellLogLoading: true,
                isWellLogLoaded: false,
                loadError: undefined,
                data: undefined
            }
        case LOAD_WELLLOG_SUCCESS:
            return {
                ...state,
                isWellLogLoading: false,
                isWellLogLoaded: true,
                loadError: undefined,
                data: action.payload.data,
            }
        case LOAD_WELLLOG_FAIL:
            return {
                ...state,
                isWellLogLoading: false,
                isWellLogLoaded: false,
                loadError: action.payload.err,
                data: undefined
            }
        default:
            return state;
    }
}