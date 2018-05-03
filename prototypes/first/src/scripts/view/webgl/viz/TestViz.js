const glslify = require('glslify');

import * as THREE from 'three';

import AppAudio from '../../../audio/AppAudio';

export default class TestViz {

	constructor() {
		this.initAudio();
		this.initQuad();
	}

	initAudio() {
		this.audio = AppAudio;
		this.audio.on('audio:peak', this.onAudioPeak.bind(this));
	}

	initQuad() {
		const material = new THREE.ShaderMaterial({
			vertexShader: glslify('../../../../shaders/default.vert'),
			fragmentShader: glslify('../../../../shaders/default.frag'),
			wireframe: true,
		});

		const geometry = new THREE.PlaneGeometry(1, 1);
		const mesh = new THREE.Mesh(geometry, material);

		this.object3D = mesh;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize(textureAspect = 1) {
		// return;
		const screenAspect = window.innerWidth / window.innerHeight;

		// portrait
		if (screenAspect < textureAspect) {
			this.object3D.scale.y = window.innerHeight;
			this.object3D.scale.x = window.innerHeight * textureAspect;
		// landscape
		} else {
			this.object3D.scale.x = window.innerWidth;
			this.object3D.scale.y = window.innerWidth / textureAspect;
		}
	}

	onAudioPeak(e) {

	}

}