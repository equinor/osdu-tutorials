import fetchMock from 'fetch-mock';
import {
  findWellsByNameAction,
  findWellsByNameStartAction,
  findWellsByNameSuccessAction,
  findWellsByNameFailAction,
  findWellboresAction,
  findWellboresStartAction,
  findWellboresSuccessAction,
  findWellboresFailAction,
} from './actions';
import thunk, { ThunkDispatch } from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { findWellsByNameResponse, findWellboresResponse } from 'test-data/well-search';
import {
  WellSearchActionTypes,
  FIND_WELLS_BY_NAME_START,
  FIND_WELLS_BY_NAME_SUCCESS,
  FIND_WELLS_BY_NAME_FAIL,
  FIND_WELLBORES_START,
  FIND_WELLBORES_SUCCESS,
  FIND_WELLBORES_FAIL,
} from './types';
import { WellSearchState } from './reducer';
import { AppState } from 'store';

const middlewares = [thunk];
const mockStore = configureMockStore<
  WellSearchState,
  ThunkDispatch<AppState, null, WellSearchActionTypes>
>(middlewares);

describe('Well Search actions', () => {
  let store = mockStore();
  let action: WellSearchActionTypes;
  let expectedActions: WellSearchActionTypes[];

  beforeEach(() => {
    store = mockStore();
    fetchMock.restore();
  });

  describe('correct action objects creation', () => {
    it('creates FIND_WELLS_BY_NAME_START action', async () => {
      action = {
        type: FIND_WELLS_BY_NAME_START,
        payload: 'WellName1',
      };

      expect(findWellsByNameStartAction('WellName1')).toEqual(action);
    });

    it('creates FIND_WELLS_BY_NAME_SUCCESS action', async () => {
      action = {
        type: FIND_WELLS_BY_NAME_SUCCESS,
        payload: findWellsByNameResponse,
      };

      expect(findWellsByNameSuccessAction(findWellsByNameResponse)).toEqual(action);
    });

    it('creates FIND_WELLS_BY_NAME_FAIL action', async () => {
      action = {
        type: FIND_WELLS_BY_NAME_FAIL,
        payload: Error('Forbidden'),
      };

      expect(findWellsByNameFailAction(Error('Forbidden'))).toEqual(action);
    });

    it('creates FIND_WELLBORES_START action', async () => {
      action = {
        type: FIND_WELLBORES_START,
        payload: 'srn:master-data/Well:1111:',
      };

      expect(findWellboresStartAction('srn:master-data/Well:1111:')).toEqual(action);
    });

    it('creates FIND_WELLBORES_SUCCESS action', async () => {
      action = {
        type: FIND_WELLBORES_SUCCESS,
        payload: {
          wellId: 'srn:master-data/Well:1111:',
          result: findWellboresResponse,
        },
      };

      expect(findWellboresSuccessAction('srn:master-data/Well:1111:', findWellboresResponse)).toEqual(action);
    });

    it('creates FIND_WELLBORES_FAIL action', async () => {
      action = {
        type: FIND_WELLBORES_FAIL,
        payload: {
          err: Error('Forbidden'),
          wellId: 'srn:master-data/Well:1111:',
        },
      };

      expect(findWellboresFailAction(Error('Forbidden'), 'srn:master-data/Well:1111:')).toEqual(action);
    });
  });

  describe('correct FIND_WELLS_BY_NAME actions sequence', () => {
    it('triggers START to SUCCESS when data is loaded', async () => {
      const wellName = 'WellName1';

      fetchMock.get(`/api/find/wells_by_name?well_name=${wellName}`, findWellsByNameResponse);

      expectedActions = [
        findWellsByNameStartAction(wellName),
        findWellsByNameSuccessAction(findWellsByNameResponse),
      ];

      await store.dispatch(findWellsByNameAction(wellName));
      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('triggers START to FAIL when data is unavailable', async () => {
      const wellName = 'WellName1';

      fetchMock.get(`/api/find/wells_by_name?well_name=${wellName}`, {
        status: 403,
      });

      expectedActions = [
        findWellsByNameStartAction(wellName),
        findWellsByNameFailAction(Error('Forbidden')),
      ];

      await store.dispatch(findWellsByNameAction(wellName));
      expect(store.getActions()).toMatchObject(expectedActions);
    });
  });

  describe('correct FIND_WELLBORES actions sequence', () => {
    it('triggers START to SUCCESS when data is loaded', async () => {
      const wellId = 'srn:master-data/Well:1111:';

      fetchMock.get(`/api/find/wellbores_by_well_id?well_id=${wellId}`, findWellboresResponse);

      expectedActions = [
        findWellboresStartAction(wellId),
        findWellboresSuccessAction(wellId, findWellboresResponse),
      ];

      await store.dispatch(findWellboresAction(wellId));
      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('triggers START to FAIL when data is unavailable', async () => {
      const wellId = 'srn:master-data/Well:1111:';

      fetchMock.get(`/api/find/wellbores_by_well_id?well_id=${wellId}`, {
        status: 403,
      });

      expectedActions = [
        findWellboresStartAction(wellId),
        findWellboresFailAction(Error('Forbidden'), wellId),
      ];

      await store.dispatch(findWellboresAction(wellId));
      expect(store.getActions()).toMatchObject(expectedActions);
    });
  });
});
