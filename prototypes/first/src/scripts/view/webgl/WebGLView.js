const glslify = require('glslify');
import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';

export default class WebGLView {

	constructor(view, audio) {
		this.view = view;
		this.audio = audio;
		this.renderer = this.view.renderer;

		this.peakScale = 1.0;

		this.initThree();
		// this.initControls();
		this.initObject();

		this.audio.on('audio:peak', this.onAudioPeak.bind(this));
	}

	initThree() {
		// scene
		this.scene = new THREE.Scene();

		// camera
		this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.z = 300;
	}

	initControls() {
		this.controls = new TrackballControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);
		this.controls.rotateSpeed = 2.0;
		this.controls.zoomSpeed = 0.8;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = false;
		this.controls.dynamicDampingFactor = 0.15;
		this.controls.maxDistance = 3000;
		this.controls.enabled = true;
	}

	initObject() {
		const geometry = new THREE.BoxGeometry(100, 100, 100);

		const material = new THREE.ShaderMaterial({
			uniforms: {},
			vertexShader: glslify('../../../shaders/default.vert'),
			fragmentShader: glslify('../../../shaders/default.frag'),
			wireframe: true
		});

		const mesh = new THREE.Mesh(geometry, material);
		this.scene.add(mesh);

		this.mesh = mesh;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		if (this.controls) this.controls.update();

		if (this.peakScale > 1.0) this.peakScale *= 0.98;

		const data = this.audio.levelsData[5] || 0.1;
		const value = data * this.peakScale;
		this.mesh.scale.set(value, value, value);
	}

	draw() {
		this.renderer.render(this.scene, this.camera);
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		if (!this.renderer) return;
		this.camera.aspect = this.view.sketch.width / this.view.sketch.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.view.sketch.width, this.view.sketch.height);
	}

	onAudioPeak(e) {
		this.camera.position.x = random(-100, 100);
		this.camera.position.y = random(-100, 100);

		this.peakScale += 1.0;

		this.camera.lookAt(new THREE.Vector3());
	}
}
