import { FetchTrajectoryPointsResponse } from 'api/trajectory.api';

export const FETCH_TRAJECTORY_POINTS_START = 'FETCH_TRAJECTORY_POINTS_START';
export const FETCH_TRAJECTORY_POINTS_SUCCESS = 'FETCH_TRAJECTORY_POINTS_SUCCESS';
export const FETCH_TRAJECTORY_POINTS_FAIL = 'FETCH_TRAJECTORY_POINTS_FAIL';

export const UNSELECT_TRAJECTORY = 'UNSELECT_TRAJECTORY';
export const UNSELECT_ALL_TRAJECTORIES = 'UNSELECT_ALL_TRAJECTORIES';

export interface FetchTrajectoryPointsStartAction {
  type: typeof FETCH_TRAJECTORY_POINTS_START;
  payload: {
    wellId: string;
    wellboreId: string;
  };
}

export interface FetchTrajectoryPointsSuccessAction {
  type: typeof FETCH_TRAJECTORY_POINTS_SUCCESS;
  payload: {
    wellId: string,
    result: FetchTrajectoryPointsResponse,
  };
}

export interface FetchTrajectoryPointsFailAction {
  type: typeof FETCH_TRAJECTORY_POINTS_FAIL;
  payload: {
    err: Error;
    wellboreId: string;
  };
}

export interface UnselectTrajectoryAction {
  type: typeof UNSELECT_TRAJECTORY;
  payload: string;
}

export interface UnselectAllTrajectoriesAction {
  type: typeof UNSELECT_ALL_TRAJECTORIES;
}

export type TrajectoryActionTypes =
  | FetchTrajectoryPointsStartAction
  | FetchTrajectoryPointsSuccessAction
  | FetchTrajectoryPointsFailAction
  | UnselectTrajectoryAction
  | UnselectAllTrajectoriesAction;
