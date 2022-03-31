export type Trajectory = {
  points: WellboreTrajectoryPoint[];
  data: WellboreTrajectoryData;
};

type WellboreTrajectoryData = {
  ExtensionProperties: ExtensionProperties;
};

type ExtensionProperties = {
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
