import {
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RGBFormat,
  ShaderMaterial,
  Texture,
} from 'three';

import AsyncPreloader from 'async-preloader';

import glsl from '../../../utils/glsl';

import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export default class TestViz {

    constructor() {
        this.initAudio();
        this.initQuad();
    }

    initAudio() {
        this.kick = 0.0;

        AppAudio.on('audio:peak', this.onAudioPeak.bind(this));
    }

    initQuad() {
        const texture = new Texture(AsyncPreloader.items.get('Texture_06'));
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        const uniforms = {
            uTime: { value: 0 },
            uTexture: { value: texture },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl('warping.frag'),
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
        // this.object3D.material.uniforms.uGlob.value *= 0.9;
        // if (this.object3D.material.uniforms.uGlob.value < 2.0) this.object3D.material.uniforms.uGlob.value = 2.0;

        const level = AppAudio.levelsData[5] || 0.01;
        const elapsed = AppView.sketch.millis * 0.001;
        const intensity = 1;
        const factor = (this.kick + 1) * pow(intensity, level * 10) + elapsed;
        
        this.object3D.material.uniforms.uTime.value = factor;

        // this.kick *= 0.9;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize(textureAspect = 1) {
        
        textureAspect = 2;
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
        // this.object3D.material.uniforms.uGlob.value += 2.0;
        // this.kick += 0.5;
    }

}
