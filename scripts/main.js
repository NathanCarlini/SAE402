import * as THREE from "three";
      import { OrbitControls } from "three/addons/controls/OrbitControls.js";
      import { VRButton } from "three/addons/webxr/VRButton.js";
      import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
      import {createObject} from './objects.js';
      import data from './temp.js';

      let container;
      let camera, scene, renderer;
      let controller1, controller2;
      let controllerGrip1, controllerGrip2;

      let raycaster;

      const intersected = [];
      const tempMatrix = new THREE.Matrix4();

      let control, group;

      init();
      animate();

      function init() {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Création de la scène
        scene = new THREE.Scene();
        const axesHelper = new THREE.AxesHelper(100);
        scene.add(axesHelper);

        // Création de la caméra
        camera = new THREE.PerspectiveCamera(
          50,
          window.innerWidth / window.innerHeight,
          1,
          100
        );
        camera.position.x = 8;
        camera.position.y = 5;
        camera.position.z = 8;

        // Création du control de la caméra en mode PC
        control = new OrbitControls(camera, container);
        control.update();

        // Création de la lumière
        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(0, 20, 0);
        scene.add(spotLight);
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper);

        // Création du sol
        const floorGeometry = new THREE.PlaneGeometry(14, 14);
        const floorMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
        //   roughness: 1.0,
        //   metalness: 0.0,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        var cvs = document.getElementsByTagName("div")[0];

        // Création murs
        let heightWall = 3;
        const wallGeometry = new THREE.PlaneGeometry(14, heightWall);
        const wallMaterial = new THREE.MeshPhongMaterial({
          color: 0x00ff00,
        });
        let walls = [];
        for (let i = 0; i < 4; i++) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          wall.translateY(heightWall / 2);
          walls.push(wall);
        }
        // walls[0].translateY()
        walls[0].translateZ(-7);
        walls[1].translateZ(7);
        walls[1].rotateY(Math.PI);
        walls[2].translateX(-7);
        walls[2].rotateY(Math.PI / 2);
        walls[3].translateX(7);
        walls[3].rotateY(-Math.PI / 2);
        scene.add(walls[0], walls[1], walls[2], walls[3]);


        group = new THREE.Group();
        scene.add(group);

        // createObject(data.width, data.height, data.depth, data.x, data.y, data.z)
        for(let i=0; i<data.length; i++){
            group.add(createObject(data[i].width, data[i].height, data[i].depth, data[i].x, data[i].y, data[i].z));
        }


        // Création du renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.xr.enabled = true;
        container.appendChild(renderer.domElement);

        document.body.appendChild(VRButton.createButton(renderer));

        // Création des controllers de la VR
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener("selectstart", onSelectStart);
        controller1.addEventListener("selectend", onSelectStart);
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener("selectstart", onSelectStart);
        controller2.addEventListener("selectend", onSelectStart);
        scene.add(controller2);

        const controllerModelFactory = new XRControllerModelFactory();

        controllerGrip1 = renderer.xr.getControllerGrip(0);
        controllerGrip1.add(
          controllerModelFactory.createControllerModel(controllerGrip1)
        );
        scene.add(controllerGrip1);

        controllerGrip2 = renderer.xr.getControllerGrip(1);
        controllerGrip2.add(
          controllerModelFactory.createControllerModel(controllerGrip2)
        );
        scene.add(controllerGrip2);

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1),
        ]);

        const line = new THREE.Line(geometry);
        line.name = "line";
        line.scale.z = 5;

        controller1.add(line.clone());
        controller2.add(line.clone());

        raycaster = new THREE.Raycaster();

        window.addEventListener("resize", onWindowResize);
      }

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function onSelectStart(event) {
        const controller = event.target;

        const intersections = getIntersections(controller);

        if (intersections.length > 0) {
          const intersection = intersections[0];

          const object = intersection.object;
          object.material.emissive.b = 1;
          // controller.attach(object);

          controller.userData.selected = object;
        }
      }

      function onSelectEnd(event) {
        const controller = event.target;

        if (controller.userData.selected !== undefined) {
          const object = controller.userData.selected;
          object.material.emissive.b = 0;
          // group.attach(object);

          controller.userData.selected = undefined;
        }
      }

      function getIntersections(controller) {
        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

        return raycaster.intersectObjects(group.children, false);
      }

      function intersectObjects(controller) {
        if (controller.userData.selected !== undefined) return;

        const line = controller.getObjectByName("line");
        const intersections = getIntersections(controller);

        if (intersections.length > 0) {
          const intersection = intersections[0];

          const object = intersection.object;
          // object.material.emissive.r = 1;
          intersected.push(object);

          line.scale.z = intersection.distance;
        } else {
          line.scale.z = 5;
        }
      }

      function cleanIntersected() {
        while (intersected.length) {
          const object = intersected.pop();
          object.material.emissive.r = 0;
        }
      }

      function animate() {
        renderer.setAnimationLoop(render);
      }

      function render() {
        cleanIntersected();
        intersectObjects(controller1);
        intersectObjects(controller2);
        renderer.render(scene, camera);
      }