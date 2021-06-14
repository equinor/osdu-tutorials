import {
  TrajectoryActionTypes,
  FETCH_TRAJECTORY_POINTS_SUCCESS,
  FETCH_TRAJECTORY_POINTS_FAIL,
  FETCH_TRAJECTORY_POINTS_START,
  UNSELECT_TRAJECTORY,
  UNSELECT_ALL_TRAJECTORIES,
} from './types';

export interface TrajectoryState {
  /** a current well, whose trajectories a to draw */
  wellId: string;

  /** a set of trajectories chosen by a user to visialize */
  trajectories: TrajectoryToDraw[];
}

const initialState: TrajectoryState = {
  wellId: '',
  trajectories: [],
};

export interface TrajectoryToDraw {
  wellboreId: string;

  /** trajectory data fetch api request progress flag */
  isLoading: boolean;

  /** proof that a fetch request was made */
  isLoaded: boolean;

  /** any error, occured during a trajectory data fetch */
  loadError?: Error;

  /** a set of points to build a trajectory's 3D model */
  points: TrajectoryPoint[];
}

interface TrajectoryPoint {
  measuredDepth: number;
  inclination: number;
  azimuth: number;
  x: number;
  y: number;
}

export const trajectoryReducer = (
  state: TrajectoryState = initialState,
  action: TrajectoryActionTypes
): TrajectoryState => {
  switch (action.type) {
    case FETCH_TRAJECTORY_POINTS_START:
      return {
        ...state,
        wellId: action.payload.wellId,
        trajectories: [
          ...(state.wellId === action.payload.wellId ? state.trajectories : []),
          {
            wellboreId: action.payload.wellboreId,
            isLoading: true,
            isLoaded: false,
            loadError: undefined,
            points: [],
          },
        ],
      };
    case FETCH_TRAJECTORY_POINTS_SUCCESS:
      return {
        ...state,
        trajectories: state.trajectories.map(t => {
          if (t.wellboreId !== action.payload.result.wellbore_id) {
            return t;
          }

          const data = action.payload.result.data;
          const points = data.azimuths.map(
            (a, i): TrajectoryPoint => ({
              azimuth: data.azimuths[i],
              inclination: data.inclinations[i],
              measuredDepth: data.measured_depths[i],
              x: data.surface_x[i],
              y: data.surface_y[i],
            })
          );

          return {
            ...t,
            isLoading: false,
            isLoaded: true,
            points,
          };
        }),
      };
    case FETCH_TRAJECTORY_POINTS_FAIL:
      return {
        ...state,
        trajectories: state.trajectories.map(t => {
          return action.payload.wellboreId === t.wellboreId
            ? {
              ...t,
              isLoading: false,
              isLoaded: true,
              loadError: action.payload.err,
            }
            : t;
        }),
      };
    case UNSELECT_TRAJECTORY:
      return {
        ...state,
        trajectories: state.trajectories.filter(t => action.payload !== t.wellboreId),
      };
    case UNSELECT_ALL_TRAJECTORIES:
      return {
        ...state,
        trajectories: [],
      };
    default:
      return state;
  }
};
