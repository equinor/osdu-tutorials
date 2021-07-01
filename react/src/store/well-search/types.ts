import { FindWellsResponse, FindWellboresResponse } from 'api/well-search.api';

export const FIND_WELLS_BY_NAME_START = 'FIND_WELLS_BY_NAME_START';
export const FIND_WELLS_BY_NAME_SUCCESS = 'FIND_WELLS_BY_NAME_SUCCESS';
export const FIND_WELLS_BY_NAME_FAIL = 'FIND_WELLS_BY_NAME_FAIL';

export const FIND_WELLBORES_START = 'FIND_WELLBORES_START';
export const FIND_WELLBORES_SUCCESS = 'FIND_WELLBORES_SUCCESS';
export const FIND_WELLBORES_FAIL = 'FIND_WELLBORES_FAIL';

export interface FindWellsStartAction {
  type: typeof FIND_WELLS_BY_NAME_START;
  payload: string;
}

export interface FindWellsSuccessAction {
  type: typeof FIND_WELLS_BY_NAME_SUCCESS;
  payload: FindWellsResponse;
}

export interface FindWellsFailAction {
  type: typeof FIND_WELLS_BY_NAME_FAIL;
  payload: Error;
}

export interface FindWellboresStartAction {
  type: typeof FIND_WELLBORES_START;
  payload: string;
}

export interface FindWellboresSuccessAction {
  type: typeof FIND_WELLBORES_SUCCESS;
  payload: {
    wellId: string;
    result: FindWellboresResponse;
  }
}

export interface FindwellboresFailAction {
  type: typeof FIND_WELLBORES_FAIL;
  payload: {
    err: Error;
    wellId: string;
  }
}

export type WellSearchActionTypes =
  | FindWellsStartAction
  | FindWellsSuccessAction
  | FindWellsFailAction
  | FindWellboresStartAction
  | FindWellboresSuccessAction
  | FindwellboresFailAction;
