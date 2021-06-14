import { AppState } from 'store';
import { ThunkAction } from 'redux-thunk';
import {
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_SUCCESS,
  FIND_WELLS_BY_NAME_FAIL,
  WellSearchActionTypes,
} from './types';
import { FindWellsResponse, findWellsByName } from 'api/well-search.api';

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, WellSearchActionTypes>;

export function findWellsByNameStartAction(wellName: string): WellSearchActionTypes {
  return {
    type: FIND_WELLS_BY_NAME_START,
    payload: wellName,
  };
}

export function findWellsByNameSuccessAction(response: FindWellsResponse): WellSearchActionTypes {
  return {
    type: FIND_WELLS_BY_NAME_SUCCESS,
    payload: response,
  };
}

export function findWellsByNameFailAction(err: Error): WellSearchActionTypes {
  return {
    type: FIND_WELLS_BY_NAME_FAIL,
    payload: err,
  };
}


/**
 * fetch from the osdu backend a list of wells, matching a querried name
 * @param wellName
 */
export const findWellsByNameAction = (wellName: string): AppThunk => dispatch => {
  dispatch(findWellsByNameStartAction(wellName));

  return findWellsByName(wellName)
    .then(data => dispatch(findWellsByNameSuccessAction(data)))
    .catch(err => dispatch(findWellsByNameFailAction(err)));
};
