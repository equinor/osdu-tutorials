import { Vector3, VertexColors, WebGLRenderer } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';


interface TrajectoryDataPoint {
  measuredDepth: number;
  inclination: number;
  azimuth: number;
  x: number,
  y: number
}

interface TrajectoryData {
  points: TrajectoryDataPoint[];
}


export function calculateNextTrajectoryPoint(
  prev: Vector3,
  prevPointMeasuredDepth: number,
  nextPointData: TrajectoryDataPoint
): Vector3 {
  const nextPoint = new Vector3();
  const degToRad = Math.PI / 180;

  const depthDelta = nextPointData.measuredDepth - prevPointMeasuredDepth;
  const dx =
    depthDelta *
    Math.sin(degToRad * nextPointData.inclination) *
    Math.cos(degToRad * nextPointData.azimuth);
  const dy = -depthDelta * Math.cos(degToRad * nextPointData.inclination);
  const dz =
    depthDelta *
    Math.sin(degToRad * nextPointData.inclination) *
    Math.sin(degToRad * nextPointData.azimuth);

  nextPoint.x = prev.x + dx; //width and north direction
  nextPoint.y = prev.y + dy; //depth
  nextPoint.z = prev.z + dz; //height

  return nextPoint;
}

export function calculateTrajectoryPointsIn3D(trajectory: TrajectoryData): Vector3[] {
  const pointsIn3D: Vector3[] = [];
  const numberOfPoints: number = trajectory.points.length;

  const firstPointData = trajectory.points[0];
  const firstPoint = new Vector3(0, -firstPointData.measuredDepth, 0);
  pointsIn3D.push(firstPoint);

  let prevPoint = firstPoint.clone();
  let prevPointMeasuredDepth = firstPointData.measuredDepth;
  for (let i = 1; i < numberOfPoints; i++) {
    const nextPointData = trajectory.points[i];

    const nextPoint = calculateNextTrajectoryPoint(
      prevPoint,
      prevPointMeasuredDepth,
      nextPointData
    );
    pointsIn3D.push(nextPoint);

    prevPoint = nextPoint;
    prevPointMeasuredDepth = nextPointData.measuredDepth;
  }

  return pointsIn3D;
}

const lineColors = [
  [255, 255, 0],
  [255, 0, 255],
  [0, 255, 255],
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
];

export function createLine2(points: Vector3[], lineIndex: number): Line2 {
  const positions: number[] = [];
  const colors: number[] = [];

  points.forEach(v => {
    positions.push(v.x, v.y, v.z);
    colors.push(...lineColors[lineIndex % lineColors.length]);
  });

  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions(positions);
  lineGeometry.setColors(colors);

  const lineMaterial = new LineMaterial({
    color: 0xffffff,
    linewidth: 3,
    vertexColors: VertexColors,
    dashed: false
  });

  const line = new Line2(lineGeometry, lineMaterial);

  line.onBeforeRender = (renderer: WebGLRenderer) => {
    renderer.getSize(lineMaterial.resolution)
  }

  return line;
}

export function createTrajectoryLine(points: Vector3[], lineIndex: number) {
  const trajectory = createLine2(points, lineIndex);

  const trajectoryFirstPointHeight = points[0].y;
  trajectory.translateY(-trajectoryFirstPointHeight);

  return trajectory;
}
