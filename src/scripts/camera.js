import * as THREE from "three";
import gsap from "gsap";

// -- Constants --
const DEG2RAD = Math.PI / 180.0;
const RIGHT_MOUSE_BUTTON = 2;
const MIDDLE_MOUSE_BUTTON = 4;

// Camera constraints
const CAMERA_SIZE = 5;
const MIN_CAMERA_RADIUS = 0.1;
const MAX_CAMERA_RADIUS = 5;
const MIN_CAMERA_ELEVATION = 45;
const MAX_CAMERA_ELEVATION = 45;

// Camera sensitivity
const AZIMUTH_SENSITIVITY = 0.2;
const ELEVATION_SENSITIVITY = 0.2;
const ZOOM_SENSITIVITY = 0.002;
const PAN_SENSITIVITY = -0.01;

const Y_AXIS = new THREE.Vector3(0, 1, 0);

let movement = { w: false, s: false, a: false, d: false };

export class CameraManager {
  constructor() {
    const aspect =
      window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;

    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2,
      1,
      1000
    );
    this.camera.layers.enable(1);

    this.cameraOrigin = new THREE.Vector3(8, 0, 8);
    this.cameraRadius = 0.5;
    this.cameraAzimuth = 225;
    this.cameraElevation = 45;

    this.updateCameraPosition();

    window.ui.gameWindow.addEventListener(
      "wheel",
      this.onMouseScroll.bind(this),
      false
    );
    window.ui.gameWindow.addEventListener(
      "mousedown",
      this.onMouseMove.bind(this),
      false
    );
    window.ui.gameWindow.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
      false
    );
    window.document.addEventListener(
      "keydown",
      this.onKeyDown.bind(this),
      false
    );
    window.document.addEventListener("keyup", this.onKeyUp.bind(this), false);
  }

  /**
   * Applies any changes to camera position/orientation
   */
  updateCameraPosition() {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x =
      100 *
      Math.sin(this.cameraAzimuth * DEG2RAD) *
      Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z =
      100 *
      Math.cos(this.cameraAzimuth * DEG2RAD) *
      Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.position.lerp(this.cameraOrigin, 0.2);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  onKeyDown(event) {
    const key = event.key;

    if (key === "w") {
      movement = { ...movement, w: true };
    }
    if (key === "s") {
      movement = { ...movement, s: true };
    }
    if (key === "a") {
      movement = { ...movement, a: true };
    }
    if (key === "d") {
      movement = { ...movement, d: true };
    }

    this.updateKeyboardMovement();
  }

  onKeyUp(event) {
    const key = event.key;

    if (key === "w") {
      movement = { ...movement, w: false };
    }
    if (key === "s") {
      movement = { ...movement, s: false };
    }
    if (key === "a") {
      movement = { ...movement, a: false };
    }
    if (key === "d") {
      movement = { ...movement, d: false };
    }

    this.updateKeyboardMovement();
  }

  updateKeyboardMovement() {
    const { w, a, s, d } = movement;

    const newTarget = this.cameraOrigin.clone();
    if (w) {
      newTarget.y += 0.5;
    }
    if (s) {
      newTarget.y += -0.5;
    }
    if (a) {
      newTarget.x += 0.5;
    }
    if (d) {
      newTarget.x += -0.5;
    }

    gsap.to(this.cameraOrigin, {
      x: newTarget.x,
      y: newTarget.y,
      z: newTarget.z,
      duration: 0.2,
      ease: "power2.out",
      onUpdate: () => {
        this.updateCameraPosition();
      },
    });
  }

  /**
   * Event handler for `mousemove` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseMove(event) {
    // Handles the rotation of the camera
    if (event.buttons & RIGHT_MOUSE_BUTTON) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += event.movementY * ELEVATION_SENSITIVITY;
      this.cameraElevation = Math.min(
        MAX_CAMERA_ELEVATION,
        Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation)
      );
    }

    // Handles the panning of the camera
    if (event.buttons & MIDDLE_MOUSE_BUTTON) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        Y_AXIS,
        this.cameraAzimuth * DEG2RAD
      );
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(
        Y_AXIS,
        this.cameraAzimuth * DEG2RAD
      );
      this.cameraOrigin.add(
        forward.multiplyScalar(PAN_SENSITIVITY * event.movementY)
      );
      this.cameraOrigin.add(
        left.multiplyScalar(PAN_SENSITIVITY * event.movementX)
      );
    }

    this.updateCameraPosition();
  }

  /**
   * Event handler for `wheel` event
   * @param {MouseEvent} event Mouse event arguments
   */
  onMouseScroll(event) {
    this.cameraRadius *= 1 - event.deltaY * ZOOM_SENSITIVITY;
    this.cameraRadius = Math.min(
      MAX_CAMERA_RADIUS,
      Math.max(MIN_CAMERA_RADIUS, this.cameraRadius)
    );

    this.updateCameraPosition();
  }

  resize() {
    const aspect =
      window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }
}
