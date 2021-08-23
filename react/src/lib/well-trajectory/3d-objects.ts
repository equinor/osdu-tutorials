import { PlaneGeometry, MeshBasicMaterial, Mesh, DoubleSide } from 'three';
import { TrajectoryChartConfiguration } from './chart-config';

export function createSurfaceImitationPlane(chartConfig: TrajectoryChartConfiguration) {
  const geometry = new PlaneGeometry(chartConfig.width, chartConfig.depth);
  const material = new MeshBasicMaterial({ color: '#00a4a5', side: DoubleSide });
  const plane = new Mesh(geometry, material);
  const planePosition = chartConfig.leftTopPoint.clone();
  planePosition.x += chartConfig.width / 2;
  planePosition.z += chartConfig.depth / 2;

  plane.rotateX(Math.PI / 2);
  plane.position.copy(planePosition);

  return plane;
}
