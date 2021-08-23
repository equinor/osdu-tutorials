import { Vector3 } from 'three';
import {
  createCamera,
  createCameraControl,
  createRenderer,
  createScene,
  setUpCameraForChart,
} from './scene';
import { calculateTrajectoryPointsIn3D, createTrajectoryLine } from './trajectory';
import { createGridedCoordinatesSystem } from './coordinate-system';
import { createSurfaceImitationPlane } from './3d-objects';
import { createChartRootElement } from './DOM-layout';
import { calcChartConfiguration } from './chart-config';
import { TrajectoryToDraw } from 'store/trajectory';

export function createTrajectoryChart(
  container: HTMLElement,
  trajectoriesToDraw: TrajectoryToDraw[]
) {
  const root = createChartRootElement();
  container.innerHTML = '';
  container.appendChild(root);

  const renderer = createRenderer(root);
  const scene = createScene();
  const camera = createCamera(renderer);
  const cameraControl = createCameraControl(camera, renderer.domElement);

  const anyTrajectory = trajectoriesToDraw[0];
  const rootPoint = anyTrajectory.points[0];

  const trajectories = trajectoriesToDraw.map(t => calculateTrajectoryPointsIn3D(t));
  const trajectoryRealWorldCoordinates = new Vector3(
    rootPoint.x,
    -rootPoint.measuredDepth,
    rootPoint.y
  );
  const chartTopCenterPoint = new Vector3(0, 0, 0);
  const chartConfig = calcChartConfiguration(
    trajectories,
    chartTopCenterPoint,
    trajectoryRealWorldCoordinates
  );

  const coordinatesSystem = createGridedCoordinatesSystem(chartConfig);
  const surfaceImitationPlane = createSurfaceImitationPlane(chartConfig);

  // when two lines overlap, the color of the last one to draw will prevail
  // but it is more convenient to keep the color of the first chosen trajectory
  // therefore we will add them in a backward order
  for (let i = trajectories.length - 1; i >= 0; i--) {
    scene.add(createTrajectoryLine(trajectories[i], i));
  }

  scene.add(coordinatesSystem);
  scene.add(surfaceImitationPlane);

  setUpCameraForChart(camera, cameraControl, chartConfig);

  function render() {
    renderer.render(scene, camera);
  }

  function renderLoop() {
    cameraControl.update();
    render();
    requestAnimationFrame(renderLoop);
  }

  renderLoop();

  window.addEventListener('resize', () => {
    camera.aspect = root.clientWidth / root.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(root.clientWidth, root.clientHeight);
  });
}
