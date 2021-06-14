import { trajectoryReducer } from './reducer';
import {
  TrajectoryActionTypes,
  FETCH_TRAJECTORY_POINTS_START,
  FETCH_TRAJECTORY_POINTS_SUCCESS,
  FETCH_TRAJECTORY_POINTS_FAIL,
  UNSELECT_TRAJECTORY,
  UNSELECT_ALL_TRAJECTORIES,
} from './types';
import {
  trajectoryInitialState,
  trajectoryFetchPointsStartState,
  fetchTrajectoryPointsResponse,
  trajectoryFetchPointsSuccessState,
  trajectoryFetchPointsFailState,
  trajectoryUnselectState,
  trajectoryUnselectAllState,
} from 'test-data/trajectory';

describe('WellSearch reducer', () => {
  it('should return default state', () => {
    expect(trajectoryReducer(undefined, {} as TrajectoryActionTypes)).toEqual(
      trajectoryInitialState
    );
  });

  it('should handle FETCH_TRAJECTORY_POINTS_START', () => {
    expect(
      trajectoryReducer(trajectoryInitialState, {
        type: FETCH_TRAJECTORY_POINTS_START,
        payload: {
          wellId: 'srn:master-data/Well:1111:',
          wellboreId: 'srn:master-data/Wellbore:1111:',
        },
      })
    ).toEqual(trajectoryFetchPointsStartState);
  });

  it('should handle FETCH_TRAJECTORY_POINTS_SUCCESS', () => {
    expect(
      trajectoryReducer(trajectoryFetchPointsStartState, {
        type: FETCH_TRAJECTORY_POINTS_SUCCESS,
        payload: { wellId: 'srn:master-data/Well:1111:', result: fetchTrajectoryPointsResponse },
      })
    ).toEqual(trajectoryFetchPointsSuccessState);
  });

  it('should handle FETCH_TRAJECTORY_POINTS_FAIL', () => {
    expect(
      trajectoryReducer(trajectoryFetchPointsStartState, {
        type: FETCH_TRAJECTORY_POINTS_FAIL,
        payload: {
          wellboreId: 'srn:master-data/Wellbore:1111:',
          err: Error('Forbidden'),
        },
      })
    ).toEqual(trajectoryFetchPointsFailState);
  });

  it('should handle UNSELECT_TRAJECTORY', () => {
    expect(
      trajectoryReducer(trajectoryFetchPointsSuccessState, {
        type: UNSELECT_TRAJECTORY,
        payload: 'srn:master-data/Wellbore:1111:',
      })
    ).toEqual(trajectoryUnselectState);
  });

  it('should handle UNSELECT_ALL_TRAJECTORIES', () => {
    expect(
      trajectoryReducer(trajectoryFetchPointsSuccessState, {
        type: UNSELECT_ALL_TRAJECTORIES,
      })
    ).toEqual(trajectoryUnselectAllState);
  });
});
