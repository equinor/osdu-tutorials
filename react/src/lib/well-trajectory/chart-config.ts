import { Box3, Vector3 } from 'three';
import { makeVectorCoordinatesPositive } from './math';

export interface TrajectoryChartConfiguration {
  width: number;
  height: number;
  depth: number;

  numberOfGridSegments: number;

  widthLabels: string[];
  heightLabels: string[];
  depthLabels: string[];

  leftTopPoint: Vector3;
  centerPoint: Vector3;
}

export function createLabelsText(minVal: number, maxVal: number, numberOfDivisions: number) {
  const labels: string[] = [];
  const delta: number = (maxVal - minVal) / numberOfDivisions;

  for (let i = 0; i < numberOfDivisions + 1; i++) {
    const nextVal = minVal + delta * i;
    labels.push(nextVal.toFixed(0));
  }

  return labels;
}

export function calcSpaceRequiredForTrajectory(trajectoryPoints: Vector3[][]): Vector3 {
  const boundingBox = new Box3().setFromPoints([...trajectoryPoints.flat()]);
  const trajectoryStartPoint = trajectoryPoints[0][0];

  const byAxisDistanceFromStartToMinPoint = makeVectorCoordinatesPositive(
    trajectoryStartPoint.clone().sub(boundingBox.min.clone())
  );
  const byAxisDistanceFromStartToMaxPoint = makeVectorCoordinatesPositive(
    trajectoryStartPoint.clone().sub(boundingBox.max.clone())
  );

  const greatestDistanceFromStartPointBySingleAxis = Math.max(
    byAxisDistanceFromStartToMinPoint.x * 2,
    byAxisDistanceFromStartToMinPoint.z * 2,
    byAxisDistanceFromStartToMinPoint.y,

    byAxisDistanceFromStartToMaxPoint.x * 2,
    byAxisDistanceFromStartToMaxPoint.z * 2,
    byAxisDistanceFromStartToMaxPoint.y
  );

  return new Vector3(
    greatestDistanceFromStartPointBySingleAxis,
    greatestDistanceFromStartPointBySingleAxis,
    greatestDistanceFromStartPointBySingleAxis
  );
}

export function calcChartConfiguration(
  trajectoryPoints: Vector3[][],
  chartTopCenterPoint: Vector3,
  realWorldTrajectoryCoordinates: Vector3
): TrajectoryChartConfiguration {
  const numberOfGridSegments = 5;
  const spaceForTrajectory = calcSpaceRequiredForTrajectory(trajectoryPoints);

  const centerPoint = chartTopCenterPoint.clone();
  centerPoint.y -= spaceForTrajectory.y / 2;

  const startPoint = new Vector3();
  startPoint.x = chartTopCenterPoint.x - spaceForTrajectory.x / 2;
  startPoint.y = chartTopCenterPoint.y;
  startPoint.z = chartTopCenterPoint.z - spaceForTrajectory.z / 2;

  const minHeight = -realWorldTrajectoryCoordinates.y;
  const maxHeight = realWorldTrajectoryCoordinates.y + spaceForTrajectory.y;
  const labelsForHeight = createLabelsText(minHeight, maxHeight, numberOfGridSegments);

  const minDepth = realWorldTrajectoryCoordinates.z - spaceForTrajectory.z / 2;
  const maxDepth = realWorldTrajectoryCoordinates.z + spaceForTrajectory.z / 2;
  const labelsForDepth = createLabelsText(minDepth, maxDepth, numberOfGridSegments);

  const minWidth = realWorldTrajectoryCoordinates.x - spaceForTrajectory.x / 2;
  const maxWidth = realWorldTrajectoryCoordinates.x + spaceForTrajectory.x / 2;
  const labelsForWidth = createLabelsText(minWidth, maxWidth, numberOfGridSegments);

  return {
    numberOfGridSegments,

    height: spaceForTrajectory.y,
    width: spaceForTrajectory.x,
    depth: spaceForTrajectory.z,

    heightLabels: labelsForHeight,
    widthLabels: labelsForWidth,
    depthLabels: labelsForDepth,

    leftTopPoint: startPoint,
    centerPoint,
  };
}
