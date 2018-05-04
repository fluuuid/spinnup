import {
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
} from 'three';

import glsl from '../../../utils/glsl';

import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export default class TestViz {

    constructor() {
        this.initAudio();
        this.initQuad();

        this.startTime = Date.now();
    }

    initAudio() {
        AppAudio.on('audio:peak', this.onAudioPeak.bind(this));
    }

    initQuad() {
        const uniforms = {
            uTime: { value: 0 },
            uGlob: { value: 2.5 },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl('voronoi-water.frag'),
            uniforms,
            // wireframe: true,
        });

        const geometry = new PlaneGeometry(1, 1);
        const mesh = new Mesh(geometry, material);

        this.object3D = mesh;
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        this.object3D.material.uniforms.uGlob.value *= 0.9;
        if (this.object3D.material.uniforms.uGlob.value < 2.0) this.object3D.material.uniforms.uGlob.value = 2.0;

        const level = AppAudio.levelsData[5] || 0.01;
        const elapsed = (Date.now() - this.startTime) * 0.001;
        this.object3D.material.uniforms.uTime.value = level * level * 10 + elapsed;
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
        this.object3D.material.uniforms.uGlob.value += 2.0;
    }

}
