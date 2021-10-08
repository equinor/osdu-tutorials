import {LOAD_HELIPORTS_FAIL, LOAD_HELIPORTS_START, LOAD_HELIPORTS_SUCCESS, LoadHeliportsType} from "./types";
import {ThunkAction} from "redux-thunk";
import {AppState} from "../index";
import {LoadHeliportResponse, loadHeliports} from "../../api/heliport.api";


type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, LoadHeliportsType>;


export function loadHeliportsStartAction(): LoadHeliportsType{
    return {
        type: LOAD_HELIPORTS_START,
    }
}

export function loadHeliportsSuccessAction(response: LoadHeliportResponse): LoadHeliportsType{
    return {
        type: LOAD_HELIPORTS_SUCCESS,
        payload: response
    }
}

export function loadHeliportsFailAction(err: Error): LoadHeliportsType{
    return {
        type: LOAD_HELIPORTS_FAIL,
        payload: err
    }
}

export const loadHeliportsAction = (): AppThunk => dispatch => {
    dispatch(loadHeliportsStartAction());
    return loadHeliports()
        .then(data => dispatch(loadHeliportsSuccessAction(data)))
        .catch(err => dispatch(loadHeliportsFailAction(err)));
}