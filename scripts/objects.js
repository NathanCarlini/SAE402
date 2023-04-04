import * as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import { VRButton } from "three/addons/webxr/VRButton.js";
    import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

export function createObject(
  width,
  height,
  depth,
  positionX,
  positionY,
  positionZ,
  textureURL
) {
  let heightBox = 2;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
      roughness: 0.7,
      metalness: 0.0,
  });

// const loader = new THREE.TextureLoader();

// const texture = loader.load (textureURL)

// const material = new THREE.MeshPhongMaterial();

// material.map = texture;


  const object = new THREE.Mesh(geometry, material);

  object.position.x = positionX;
  object.position.y = positionY;
  object.position.z = positionZ;

  object.castShadow = true;
  object.receiveShadow = true;

  return object;
}
