import {AppState} from 'store';
import {ThunkAction} from 'redux-thunk';
import {
  FIND_WELLBORES_FAIL,
  FIND_WELLBORES_START,
  FIND_WELLBORES_SUCCESS,
  FIND_WELLS_BY_NAME_FAIL,
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_SUCCESS,
  WellSearchActionTypes,
} from './types';
import {FindWellboresResponse, findWellsByName, FindWellsResponse, findWellbores} from 'api/well-search.api';

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

export function findWellboresStartAction(wellId: string): WellSearchActionTypes {
  return {
    type: FIND_WELLBORES_START,
    payload: wellId,
  };
}

export function findWellboresSuccessAction(
    wellId: string,
    response: FindWellboresResponse
): WellSearchActionTypes {
  return {
    type: FIND_WELLBORES_SUCCESS,
    payload: {
      wellId: wellId,
      result: response,
    }
  };
}

export function findWellboresFailAction(err: Error, wellId: string): WellSearchActionTypes {
  return {
    type: FIND_WELLBORES_FAIL,
    payload: {err, wellId: wellId}
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

/**
 * fetch from the backend a list of wellbores for a given well
 * @param wellId
 */
export const findWellboresAction = (wellId: string): AppThunk => dispatch => {
  dispatch(findWellboresStartAction(wellId));

  return findWellbores(wellId)
      .then(data => dispatch(findWellboresSuccessAction(wellId, data)))
      .catch(err => dispatch(findWellboresFailAction(err, wellId)));
};
