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
  tex
) {
  let heightBox = 2;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    //   roughness: 0.7,
    //   metalness: 0.0,
  });
  // var loader = new THREE.TextureLoader();
  // //allow cross origin loading
  // loader.crossOrigin = '';

  // var material = new THREE.MeshBasicMaterial();

//  let tex = loader.load("https://media.gettyimages.com/id/625763258/fr/photo/nicolas-cage-attends-the-german-sustainability-award-2016-at-maritim-hotel-on-november-25-2016.jpg?s=612x612&w=gi&k=20&c=oQv1fk5Xwu_tsjX84k2SJoQbPRGND1qKBcEWHcEOebs=")
//   material.map = tex


  const object = new THREE.Mesh(geometry, material);

  object.position.x = positionX;
  object.position.y = positionY;
  object.position.z = positionZ;

  object.castShadow = true;
  object.receiveShadow = true;

  return object;
}
