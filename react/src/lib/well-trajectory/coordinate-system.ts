import {
  Geometry,
  Vector3,
  LineSegments,
  LineBasicMaterial,
  Object3D,
  Texture,
  SpriteMaterial,
  Sprite,
  PerspectiveCamera,
  Vector2,
  LinearFilter,
  Camera,
} from 'three';
import { TrajectoryChartConfiguration } from './chart-config';

interface GridConfig {
  width: number;
  height: number;
  widthSegments: number;
  heightSegments: number;
  color: number;
}

interface LabelConfig {
  shiftX?: LabelShift;
  shiftY?: LabelShift;
  shiftZ?: LabelShift;
  rotationCenter: Vector2;
}

interface LabelShift {
  multiplier: number;
  dimension: 'width' | 'height';
}

export enum Sides {
  top,
  bottom,
  left,
  right,
}

export function measureTextWidth(text: string, fontSize: number, fontFace: string) {
  let textWidth = 0;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context) {
    context.font = `${fontSize}px ${fontFace}`;
    textWidth = context.measureText(text).width;
  }

  return textWidth;
}

export function createTextSprite(text: string, config: LabelConfig) {
  const fontface = 'Roboto';
  const fontsize = 14;
  const canvas = document.createElement('canvas');
  canvas.width = measureTextWidth(text, fontsize, fontface) + 30;
  canvas.height = fontsize + 10;

  const context = canvas.getContext('2d');

  if (context) {
    context.font = `${fontsize}px ${fontface}`;
    context.fillStyle = 'rgba(210, 210, 210, 1.0)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new Texture(canvas);
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;

  const spriteMaterial = new SpriteMaterial({
    map: texture,
  });

  const sprite = new Sprite(spriteMaterial);
  sprite.center.copy(config.rotationCenter);

  sprite.onBeforeRender = (renderer, scene, camera: Camera) => {
    // as threejs provides no generic for Camera for the type Sprite,
    // we'll cast it manually, basing on a sacred knowledge
    const cam = camera as PerspectiveCamera;

    const spriteWorldPos = sprite.getWorldPosition(new Vector3());

    const distance = cam.position.distanceTo(spriteWorldPos);
    const vFOV = (cam.fov * Math.PI) / 180; //
    const height = 2 * Math.tan(vFOV / 2) * distance;

    const scenePixWidth = renderer.getSize(new Vector2()).x;
    const scenePixHeight = renderer.getSize(new Vector2()).y;
    const pixelsHeightRatio = scenePixHeight / height;
    const pixWidthRatio = (scenePixWidth / scenePixHeight) * pixelsHeightRatio;

    const desiredHeight = canvas.height / pixelsHeightRatio;
    const desiredWidth = canvas.width / pixWidthRatio;
    sprite.scale.set(desiredWidth, desiredHeight, 1);

    if (config.shiftX) {
      const dimensionSize = config.shiftX.dimension === 'height' ? desiredHeight : desiredWidth;
      sprite.position.x = (config.shiftX.multiplier * dimensionSize) / 2;
    }
    if (config.shiftY) {
      const dimensionSize = config.shiftY.dimension === 'height' ? desiredHeight : desiredWidth;
      sprite.position.y = (config.shiftY.multiplier * dimensionSize) / 2;
    }
    if (config.shiftZ) {
      const dimensionSize = config.shiftZ.dimension === 'height' ? desiredHeight : desiredWidth;
      sprite.position.z = (config.shiftZ.multiplier * dimensionSize) / 2;
    }
  };

  const spriteBox = new Object3D();
  spriteBox.add(sprite);

  return spriteBox;
}

export function createLabel(text: string, position: Vector3, config: LabelConfig) {
  const labelObject = createTextSprite(text, config);
  labelObject.position.copy(position);

  return labelObject;
}

export function createLabels(
  distance: number,
  labels: string[],
  direction: 'x' | 'y' | 'z',
  inverseLabelsOrder: boolean,
  labelsConfig: LabelConfig
) {
  const labelsLocal = inverseLabelsOrder ? labels.slice().reverse() : labels;
  const labelsObject = new Object3D();
  const numberOfDivisions = labels.length - 1;
  const delta = distance / numberOfDivisions;

  const nextLabelCoord = new Vector3(0, 0, 0);

  for (let i = 0; i <= numberOfDivisions; i++) {
    const label = createLabel(labelsLocal[i], nextLabelCoord, labelsConfig);
    labelsObject.add(label);

    nextLabelCoord[direction] += delta;
  }

  return labelsObject;
}

export function createGrid(config: GridConfig) {
  const { width, height, widthSegments, heightSegments, color } = config;

  const segmentWidth = width / widthSegments;
  const segmentHeight = height / heightSegments;
  const geometry = new Geometry();

  const numberOfVerticalLines = widthSegments + 1;
  const numberOfHorisontalLines = heightSegments + 1;

  // vertical lines
  for (let i = 0; i < numberOfVerticalLines; i++) {
    const x = i * segmentWidth;

    geometry.vertices.push(new Vector3(x, 0, 0));
    geometry.vertices.push(new Vector3(x, height, 0));
  }

  // horisontal lines
  for (let j = 0; j < numberOfHorisontalLines; j++) {
    const y = j * segmentHeight;

    geometry.vertices.push(new Vector3(0, y, 0));
    geometry.vertices.push(new Vector3(width, y, 0));
  }

  const material = new LineBasicMaterial({ color });
  const grid = new LineSegments(geometry, material);

  return grid;
}

export function createGridedCoordinatesSystem(chartConfig: TrajectoryChartConfiguration) {
  const gridXY = createGrid({
    width: chartConfig.width,
    height: chartConfig.height,
    widthSegments: chartConfig.numberOfGridSegments,
    heightSegments: chartConfig.numberOfGridSegments,
    color: 0xffffff,
  });

  const gridYZ = createGrid({
    width: chartConfig.depth,
    height: chartConfig.height,
    widthSegments: chartConfig.numberOfGridSegments,
    heightSegments: chartConfig.numberOfGridSegments,
    color: 0xffffff,
  });
  gridYZ.rotateY(-Math.PI / 2);

  const gridXZ = createGrid({
    width: chartConfig.width,
    height: chartConfig.depth,
    widthSegments: chartConfig.numberOfGridSegments,
    heightSegments: chartConfig.numberOfGridSegments,
    color: 0xffffff,
  });
  gridXZ.rotateX(Math.PI / 2);

  const labesForXConf: LabelConfig = {
    rotationCenter: new Vector2(0.5, 0.5),
    shiftZ: {
      dimension: 'width',
      multiplier: 1,
    },
    shiftY: {
      dimension: 'height',
      multiplier: -1,
    },
  };
  const labesForAxesX = createLabels(
    chartConfig.width,
    chartConfig.widthLabels,
    'x',
    false,
    labesForXConf
  );

  const labesForYConf: LabelConfig = {
    rotationCenter: new Vector2(1, 0.5),
    shiftX: {
      dimension: 'width',
      multiplier: -0.25,
    },
    shiftZ: {
      dimension: 'width',
      multiplier: 0.25,
    },
  };
  const labesForAxesY = createLabels(
    chartConfig.height,
    chartConfig.heightLabels,
    'y',
    true,
    labesForYConf
  );

  const labesForZConf: LabelConfig = {
    rotationCenter: new Vector2(0.5, 0.5),
    shiftX: {
      dimension: 'width',
      multiplier: 1,
    },
    shiftY: {
      dimension: 'height',
      multiplier: -1,
    },
  };
  const labesForAxesZ = createLabels(
    chartConfig.depth,
    chartConfig.depthLabels,
    'z',
    true,
    labesForZConf
  );

  labesForAxesX.position.z = chartConfig.depth;
  labesForAxesY.position.z = chartConfig.depth;
  labesForAxesZ.position.x = chartConfig.width;

  const gridedCoordinateSystem = new Object3D();
  gridedCoordinateSystem.add(gridXY);
  gridedCoordinateSystem.add(gridXZ);
  gridedCoordinateSystem.add(gridYZ);
  gridedCoordinateSystem.add(labesForAxesX);
  gridedCoordinateSystem.add(labesForAxesY);
  gridedCoordinateSystem.add(labesForAxesZ);

  const coordinateSystemPosition = chartConfig.leftTopPoint.clone();
  coordinateSystemPosition.y -= chartConfig.height;

  gridedCoordinateSystem.position.copy(coordinateSystemPosition);

  return gridedCoordinateSystem;
}
