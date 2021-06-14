import fetchMock from 'fetch-mock';
import {
  fetchTrajectoryPointsStartAction,
  fetchTrajectoryPointsSuccessAction,
  fetchTrajectoryPointsFailAction,
  fetchTrajectoryPointsAction,
  unselectTrajectoryAction,
  unselectAllTrajectoriesAction,
} from './actions';
import {
  TrajectoryActionTypes,
  FETCH_TRAJECTORY_POINTS_START,
  FETCH_TRAJECTORY_POINTS_SUCCESS,
  FETCH_TRAJECTORY_POINTS_FAIL,
  UNSELECT_TRAJECTORY,
  UNSELECT_ALL_TRAJECTORIES,
} from './types';
import thunk, { ThunkDispatch } from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { fetchTrajectoryPointsResponse } from 'test-data/trajectory';
import { TrajectoryState } from './reducer';
import { AppState } from 'store';

const middlewares = [thunk];
const mockStore = configureMockStore<
  TrajectoryState,
  ThunkDispatch<AppState, null, TrajectoryActionTypes>
>(middlewares);

describe('Trajectory actions', () => {
  let store = mockStore();
  let action: TrajectoryActionTypes;

  beforeEach(() => {
    store = mockStore();
  });

  describe('correct action objects creation', () => {
    it('creates UNSELECT_TRAJECTORY action', async () => {
      const wellboreId = 'srn:master-data/Wellbore:1111:';
      action = {
        type: UNSELECT_TRAJECTORY,
        payload: wellboreId,
      };

      expect(unselectTrajectoryAction(wellboreId)).toEqual(action);
    });

    it('creates UNSELECT_ALL_TRAJECTORIES action', async () => {
      action = {
        type: UNSELECT_ALL_TRAJECTORIES,
      };

      expect(unselectAllTrajectoriesAction()).toEqual(action);
    });

    it('creates FETCH_TRAJECTORY_POINTS_START action', async () => {
      const wellId = 'srn:master-data/Well:1111:';
      const wellboreId = 'srn:master-data/Wellbore:1111:';
      action = {
        type: FETCH_TRAJECTORY_POINTS_START,
        payload: {
          wellId: wellId,
          wellboreId: wellboreId,
        },
      };

      expect(fetchTrajectoryPointsStartAction(wellId, wellboreId)).toEqual(action);
    });

    it('creates FETCH_TRAJECTORY_POINTS_SUCCESS action', async () => {
      const wellId = 'srn:master-data/Well:1111:';
      action = {
        type: FETCH_TRAJECTORY_POINTS_SUCCESS,
        payload: {
          wellId: wellId,
          result: fetchTrajectoryPointsResponse,
        },
      };
      expect(fetchTrajectoryPointsSuccessAction(wellId, fetchTrajectoryPointsResponse)).toEqual(
        action
      );
    });

    it('creates FETCH_TRAJECTORY_POINTS_FAIL action', async () => {
      const err = Error('Forbidden');
      const wellboreId = 'srn:master-data/Wellbore:1111:';
      action = {
        type: FETCH_TRAJECTORY_POINTS_FAIL,
        payload: {
          err,
          wellboreId: wellboreId,
        },
      };

      expect(fetchTrajectoryPointsFailAction(err, wellboreId)).toEqual(action);
    });
  });

  describe('correct FETCH_TRAJECTORY_POINTS actions sequence', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    it('triggers START to SUCCESS when data is loaded', async () => {
      const wellId = 'srn:master-data/Well:1111:';
      const wellboreId = 'srn:master-data/Wellbore:1111:';

      fetchMock.get(`/api/fetch/trajectory_by_wellbore_id?wellbore_id=${wellboreId}`, fetchTrajectoryPointsResponse);

      const expectedActions = [
        fetchTrajectoryPointsStartAction(wellId, wellboreId),
        fetchTrajectoryPointsSuccessAction(wellId, fetchTrajectoryPointsResponse),
      ];

      await store.dispatch(fetchTrajectoryPointsAction(wellId, wellboreId));
      expect(store.getActions()).toMatchObject(expectedActions);
    });

    it('triggers START to FAIL when data is unavailable', async () => {
      const wellId = 'srn:master-data/Well:1111:';
      const wellboreId = 'srn:master-data/Wellbore:1111:';

      fetchMock.get(`/api/fetch/trajectory_by_wellbore_id?wellbore_id=${wellboreId}`, 403);

      const expectedActions = [
        fetchTrajectoryPointsStartAction(wellId, wellboreId),
        fetchTrajectoryPointsFailAction(Error('Forbidden'), wellboreId),
      ];

      await store.dispatch(fetchTrajectoryPointsAction(wellId, wellboreId));
      expect(store.getActions()).toMatchObject(expectedActions);
    });
  });
});
