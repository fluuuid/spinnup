import * as THREE from 'three';

import AppAudio from '../../audio/AppAudio';
import AppView from '../../view/AppView';
import TestViz from './viz/TestViz';

export default class WebGLView {

	constructor() {
		this.view = AppView;
		this.audio = AppAudio;
		this.renderer = this.view.renderer;

		this.initThree();
		this.initViz();
	}

	initThree() {
		// scene
		this.scene = new THREE.Scene();

		// orthographic camera
		this.hw = window.innerWidth * 0.5;
		this.hh = window.innerHeight * 0.5;
		this.camera = new THREE.OrthographicCamera(-this.hw, this.hw, this.hh, -this.hh, -10000, 10000);
		this.camera.position.z = 10;
	}

	initViz() {
		this.viz = new TestViz();
		this.scene.add(this.viz.object3D);
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
		this.viz.update();
	}

	draw() {
		this.renderer.render(this.scene, this.camera);
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		if (!this.renderer) return;
		
		// orthographic camera
		this.hw = window.innerWidth * 0.5;
		this.hh = window.innerHeight * 0.5;

		this.camera.left = -this.hw;
		this.camera.right = this.hw;
		this.camera.top = this.hh;
		this.camera.bottom = -this.hh;
		this.camera.updateProjectionMatrix();

		this.viz.resize();

		this.renderer.setSize(this.view.sketch.width, this.view.sketch.height);
	}
}
