import { handleErrors } from './handle-errors';

/* eslint-disable @typescript-eslint/camelcase */
export interface FetchTrajectoryPointsResponse {
  wellbore_id: string;
  data: TrajectoryData;
}
/* eslint-enable @typescript-eslint/camelcase */

/* eslint-disable @typescript-eslint/camelcase */
interface TrajectoryData {
  measured_depths: number[];
  azimuths: number[];
  inclinations: number[];
  surface_x: number[];
  surface_y: number[];
}
/* eslint-enable @typescript-eslint/camelcase */

/**
 * Returns trajectory data for a given wellbore
 * Usable for a creation of a 3d model of the trajectory
 * Error handler is included
 * @param {String} wellboreId
 */
export function fetchTrajectoryPoints(wellboreId: string): Promise<FetchTrajectoryPointsResponse> {
  return fetch(`/api/fetch/trajectory_by_wellbore_id?wellbore_id=${wellboreId}`)
    .then(handleErrors)
    .then(response => response.json());
}
