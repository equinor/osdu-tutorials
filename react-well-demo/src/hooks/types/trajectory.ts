export type Trajectory = {
  points: WellboreTrajectoryPoint[];
  data: WellboreTrajectoryData;
};

type WellboreTrajectoryData = {
  trajectory: WellboreTrajectoryPoint[];
};

export type WellboreTrajectoryPoint = {
  md: number;
  tvd: number;
  azimuth: number;
  inclination: number;
  longitude: number;
  latitude: number;
};
