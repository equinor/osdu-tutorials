import { FindWellsResponse } from 'api/well-search.api';

export const FIND_WELLS_BY_NAME_START = 'FIND_WELLS_BY_NAME_START';
export const FIND_WELLS_BY_NAME_SUCCESS = 'FIND_WELLS_BY_NAME_SUCCESS';
export const FIND_WELLS_BY_NAME_FAIL = 'FIND_WELLS_BY_NAME_FAIL';

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

export type WellSearchActionTypes =
  | FindWellsStartAction
  | FindWellsSuccessAction
  | FindWellsFailAction
