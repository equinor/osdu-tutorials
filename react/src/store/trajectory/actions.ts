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
  console.log("fetching mock data");
  dispatch(fetchTrajectoryPointsStartAction(wellId, wellboreId));
  const mockResponse: FetchTrajectoryPointsResponse = {
    wellbore_id: wellboreId,
    data: {
      measured_depths: [109, 122.95, 132.98, 142.96, 152.93],
      azimuths: [0, 171.75, 251.31, 250.95, 231.63],
      inclinations: [0, 0.07, 0.08, 0.09, 0.04],
      surface_x: [58.43590277, 58.43590277, 58.43590277, 58.43590277, 58.43590277],
      surface_y: [1.929736075, 1.929736075, 1.929736075, 1.929736075, 1.929736075],
    }
  }
  return Promise.resolve(mockResponse).then(data => dispatch(fetchTrajectoryPointsSuccessAction(wellId, data)));
  /*
  dispatch(fetchTrajectoryPointsStartAction(wellId, wellboreId));

  return fetchTrajectoryPoints(wellboreId)
    .then(data => dispatch(fetchTrajectoryPointsSuccessAction(wellId, data)))
    .catch(err => dispatch(fetchTrajectoryPointsFailAction(err, wellboreId)));
  */
};
