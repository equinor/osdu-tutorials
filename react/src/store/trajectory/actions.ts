import { AppState } from 'store';
import { ThunkAction } from 'redux-thunk';
import { fetchTrajectoryPoints, FetchTrajectoryPointsResponse } from 'api/trajectory.api';
import {
  TrajectoryActionTypes,
  FETCH_TRAJECTORY_POINTS_START,
  FETCH_TRAJECTORY_POINTS_FAIL,
  FETCH_TRAJECTORY_POINTS_SUCCESS,
  UNSELECT_TRAJECTORY,
  UNSELECT_ALL_TRAJECTORIES,
} from './types';

type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, null, TrajectoryActionTypes>;

/**
 * remove a trajectory from a list to draw
 * @param wellboreId
 */
export function unselectTrajectoryAction(wellboreId: string): TrajectoryActionTypes {
  return {
    type: UNSELECT_TRAJECTORY,
    payload: wellboreId,
  };
}

/** clear a canvas from every trajectory */
export function unselectAllTrajectoriesAction(): TrajectoryActionTypes {
  return {
    type: UNSELECT_ALL_TRAJECTORIES,
  };
}

export function fetchTrajectoryPointsStartAction(wellId: string, wellboreId: string): TrajectoryActionTypes {
  return {
    type: FETCH_TRAJECTORY_POINTS_START,
    payload: { wellId, wellboreId },
  };
}

export function fetchTrajectoryPointsSuccessAction(
  wellId: string,
  response: FetchTrajectoryPointsResponse
): TrajectoryActionTypes {
  return {
    type: FETCH_TRAJECTORY_POINTS_SUCCESS,
    payload: {
      wellId,
      result: response,
    },
  };
}

export function fetchTrajectoryPointsFailAction(err: Error, wellboreId: string): TrajectoryActionTypes {
  return {
    type: FETCH_TRAJECTORY_POINTS_FAIL,
    payload: {
      err,
      wellboreId,
    },
  };
}

/**
 * fetch from the backend a trajectory data
 * it is possible to draw multiple trajectories for a single well, therefore Well identifier is required
 * @param wellId
 * @param wellboreId
 */
export const fetchTrajectoryPointsAction = (wellId: string, wellboreId: string): AppThunk => dispatch => {
  dispatch(fetchTrajectoryPointsStartAction(wellId, wellboreId));

  return fetchTrajectoryPoints(wellboreId)
    .then(data => dispatch(fetchTrajectoryPointsSuccessAction(wellId, data)))
    .catch(err => dispatch(fetchTrajectoryPointsFailAction(err, wellboreId)));
};
