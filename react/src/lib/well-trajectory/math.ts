import { Vector3 } from 'three';

export function makeVectorCoordinatesPositive(v: Vector3): Vector3 {
    v.x = Math.abs(v.x);
    v.y = Math.abs(v.y);
    v.z = Math.abs(v.z);
    return v;
}