import { AxesHelper, Camera, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrajectoryChartConfiguration } from './chart-config';

export function createRenderer(container: HTMLElement) {
  const sceneWidth = container.clientWidth;
  const sceneHeight = container.clientHeight;

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(sceneWidth, sceneHeight);

  container.appendChild(renderer.domElement);

  return renderer;
}

export function createCamera(renderer: WebGLRenderer): PerspectiveCamera {
  const sceneWidth = renderer.domElement.clientWidth;
  const sceneHeight = renderer.domElement.clientHeight;

  const fieldOfVision = 30;
  const aspectRatio = sceneWidth / sceneHeight;
  const nearPlane = 1000;
  const farPlane = 1000000;

  const camera = new PerspectiveCamera(fieldOfVision, aspectRatio, nearPlane, farPlane);

  camera.lookAt(0, -3275.373866313359, 0);

  return camera;
}

export function createScene() {
  const scene = new Scene();

  return scene;
}

export function createAxesHelper() {
  const axes = new AxesHelper(10);
  axes.position.set(0, 0, 0);

  return axes;
}

export function createCameraControl(camera: Camera, canvas: HTMLCanvasElement) {
  const cameraControl = new OrbitControls(camera, canvas);
  cameraControl.rotateSpeed = 5;

  return cameraControl;
}

export function setUpCameraForChart(
  camera: PerspectiveCamera,
  cameraControl: OrbitControls,
  chartConfig: TrajectoryChartConfiguration
) {
  const maxChartDimension = Math.max(chartConfig.width, chartConfig.height, chartConfig.depth);

  camera.near = maxChartDimension / 100;
  camera.far = maxChartDimension * 100;

  const cameraPosition = chartConfig.centerPoint.clone();
  cameraPosition.x += 3 * chartConfig.width;
  cameraPosition.y += chartConfig.height;
  cameraPosition.z += 3 * chartConfig.depth;

  camera.position.copy(cameraPosition);
  camera.updateProjectionMatrix();

  cameraControl.target.copy(chartConfig.centerPoint);
}
