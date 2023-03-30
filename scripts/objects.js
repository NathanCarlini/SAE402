export function createObject(width,height, depth, positionX, positionY, positionZ){


let heightBox = 2;
const geometry = new THREE.BoxGeometry(width, heightBox, depth)
const material = new THREE.MeshStandardMaterial({
  color: 0xff0000,
//   roughness: 0.7,
//   metalness: 0.0,
});

const object = new THREE.Mesh(geometry, material);

object.position.x = positionX;
object.position.y = heightBox/2
object.position.z = positionZ;

object.castShadow = true;
object.receiveShadow = true;

group.add(object);}