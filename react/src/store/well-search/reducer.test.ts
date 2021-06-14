import { wellSearchReducer } from './reducer';
import {
  WellSearchActionTypes,
  FIND_WELLS_BY_NAME_FAIL,
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_SUCCESS,
  FIND_WELLBORES_START,
  FIND_WELLBORES_SUCCESS,
  FIND_WELLBORES_FAIL,
} from './types';
import {
  wellSearchInitialState,
  wellSearchWellsFindStartState,
  findWellsByNameResponse,
  wellSearchWellsFindSuccessState,
  wellSearchWellsFindFailState,
  wellSearchWellboresFindStartState,
  findWellboresResponse,
  wellSearchWellboresFindSuccessState,
  wellSearchWellboresFindFailState,
} from 'test-data/well-search';

describe('WellSearch reducer', () => {
  it('should return default state', () => {
    expect(wellSearchReducer(undefined, {} as WellSearchActionTypes)).toEqual(
      wellSearchInitialState
    );
  });

  it('should handle FIND_WELLS_BY_NAME_START', () => {
    expect(
      wellSearchReducer(undefined, {
        type: FIND_WELLS_BY_NAME_START,
        payload: 'BIR',
      })
    ).toEqual(wellSearchWellsFindStartState);
  });

  it('should handle FIND_WELLS_BY_NAME_SUCCESS', () => {
    expect(
      wellSearchReducer(wellSearchWellsFindStartState, {
        type: FIND_WELLS_BY_NAME_SUCCESS,
        payload: findWellsByNameResponse,
      })
    ).toEqual(wellSearchWellsFindSuccessState);
  });

  it('should handle FIND_WELLS_BY_NAME_FAIL', () => {
    expect(
      wellSearchReducer(wellSearchWellsFindStartState, {
        type: FIND_WELLS_BY_NAME_FAIL,
        payload: Error('Forbidden'),
      })
    ).toEqual(wellSearchWellsFindFailState);
  });

  it('should handle FIND_WELLBORES_START', () => {
    expect(
      wellSearchReducer(wellSearchWellsFindSuccessState, {
        type: FIND_WELLBORES_START,
        payload: 'srn:master-data/Well:1111:',
      })
    ).toEqual(wellSearchWellboresFindStartState);
  });

  it('should handle FIND_WELLBORES_SUCCESS', () => {
    expect(
      wellSearchReducer(wellSearchWellboresFindStartState, {
        type: FIND_WELLBORES_SUCCESS,
        payload: {
          wellId: 'srn:master-data/Well:1111:',
          result: findWellboresResponse,
        },
      })
    ).toEqual(wellSearchWellboresFindSuccessState);
  });

  it('should handle FIND_WELLBORES_FAIL', () => {
    expect(
      wellSearchReducer(wellSearchWellboresFindStartState, {
        type: FIND_WELLBORES_FAIL,
        payload: {
          wellId: 'srn:master-data/Well:1111:',
          err: Error('Forbidden'),
        },
      })
    ).toEqual(wellSearchWellboresFindFailState);
  });
});
