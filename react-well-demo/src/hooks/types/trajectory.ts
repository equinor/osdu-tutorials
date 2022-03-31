export type Trajectory = {
  points: WellboreTrajectoryPoint[];
};

export type WellboreTrajectoryPoint = {
  md: number;
  tvd: number;
  azimuth: number;
  inclination: number;
  longitude: number;
  latitude: number;
};

type WellboreTrajectoryData = {
  points: WellboreTrajectoryPoint[];
};
