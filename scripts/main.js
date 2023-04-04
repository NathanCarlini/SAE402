import * as THREE from "three";
      import { OrbitControls } from "three/addons/controls/OrbitControls.js";
      import { VRButton } from "three/addons/webxr/VRButton.js";
      import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
      import {createObject} from './objects.js';
      import data from './temp.js';
      import datascene from './scene.js';

      let container;
      let camera, scene, renderer;
      let controller1, controller2;
      let controllerGrip1, controllerGrip2;

      let raycaster;

      const intersected = [];
      const tempMatrix = new THREE.Matrix4();

      let control, group, group2;
      let marker, floor, baseReferenceSpace;

      let INTERSECTION;

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

        // Création marker pour la téléportation
        marker = new THREE.Mesh(
					new THREE.CircleGeometry( 0.25, 32 ).rotateX( - Math.PI / 2 ),
					new THREE.MeshBasicMaterial( { color: 0x808080 } )
				);
				scene.add( marker );

        // Création du sol
        const floorGeometry = new THREE.PlaneGeometry(14, 14);
        // const floorMaterial = new THREE.MeshPhongMaterial({
        //   color: 0xffffff,
        // //   roughness: 1.0,
        // //   metalness: 0.0,
        // });


        const loader2 = new THREE.TextureLoader();

        //loading texture
        const texture2 = loader2.load ("../assets/wood.jpg")
        
        //initializing material
        const floorMaterial = new THREE.MeshPhongMaterial();
        
        //setting material property
        floorMaterial.map = texture2;


        floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Création murs
        let heightWall = 3;
        const wallGeometry = new THREE.PlaneGeometry(14, heightWall);


        // const wallMaterial = new THREE.MeshPhongMaterial({
        //   color: 0x00ff00,
        // });

        const loader1 = new THREE.TextureLoader();

        //loading texture
        const texture1 = loader1.load ("../assets/blue.jpg")
        
        //initializing material
        const wallMaterial = new THREE.MeshPhongMaterial();
        
        //setting material property
        wallMaterial.map = texture1;

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

        group2 = new THREE.Group()
        scene.add(group2)

        for (let i = 0; i < data.length; i++) {
            group.add(createObject(data[i].width, data[i].height, data[i].depth, data[i].x, data[i].y, data[i].z, data[i].texture))
          };

        for (let i = 0; i < datascene.length; i++) {
            group2.add(createObject(datascene[i].width, datascene[i].height, datascene[i].depth, datascene[i].x, datascene[i].y, datascene[i].z, datascene[i].texture))
          };

        // Création du renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.xr.addEventListener( 'sessionstart', () => baseReferenceSpace = renderer.xr.getReferenceSpace() );
        renderer.xr.enabled = true;

        container.appendChild(renderer.domElement);
        document.body.appendChild(VRButton.createButton(renderer));

        // Création des fonctions pour les téléportations
        function moveStart() {

					this.userData.isSelecting = true;

				}

				function moveEnd() {

					this.userData.isSelecting = false;

					if ( INTERSECTION ) {

						const offsetPosition = { x: - INTERSECTION.x, y: - INTERSECTION.y, z: - INTERSECTION.z, w: 1 };
						const offsetRotation = new THREE.Quaternion();
						const transform = new XRRigidTransform( offsetPosition, offsetRotation );
						const teleportSpaceOffset = baseReferenceSpace.getOffsetReferenceSpace( transform );

						renderer.xr.setReferenceSpace( teleportSpaceOffset );

					}

				}

        // Création des controllers de la VR
        controller1 = renderer.xr.getController(0);
        controller1.addEventListener("selectstart", onSelectStart);
        controller1.addEventListener("selectend", onSelectStart);
        controller1.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller1.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
        scene.add(controller1);

        controller2 = renderer.xr.getController(1);
        controller2.addEventListener("selectstart", moveStart);
        controller2.addEventListener("selectend", moveEnd);
        controller2.addEventListener( 'connected', function ( event ) {

					this.add( buildController( event.data ) );

				} );
				controller2.addEventListener( 'disconnected', function () {

					this.remove( this.children[ 0 ] );

				} );
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

      function buildController( data ) {

				let geometry, material;

				switch ( data.targetRayMode ) {

					case 'tracked-pointer':

						geometry = new THREE.BufferGeometry();
						geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 0, 0, - 1 ], 3 ) );
						geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( [ 0.5, 0.5, 0.5, 0, 0, 0 ], 3 ) );

						material = new THREE.LineBasicMaterial( { vertexColors: true, blending: THREE.AdditiveBlending } );

						return new THREE.Line( geometry, material );

					case 'gaze':

						geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
						material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
						return new THREE.Mesh( geometry, material );

				}

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
          // object.material.emissive.r = 0;
        }
      }

      function animate() {
        renderer.setAnimationLoop(render);
      }

      function render() {
        INTERSECTION = undefined;

				if ( controller2.userData.isSelecting === true ) {

					tempMatrix.identity().extractRotation( controller2.matrixWorld );

					raycaster.ray.origin.setFromMatrixPosition( controller2.matrixWorld );
					raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

					const intersects = raycaster.intersectObjects( [ floor, group, group2 ] );

					if ( intersects.length > 0 ) {

						INTERSECTION = intersects[ 0 ].point;

					}

				}

				if ( INTERSECTION ) marker.position.copy( INTERSECTION );

				marker.visible = INTERSECTION !== undefined;

        cleanIntersected();
        intersectObjects(controller1);
        renderer.render(scene, camera);
      }