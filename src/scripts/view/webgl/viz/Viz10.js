import { RepeatWrapping, Vector2 } from 'three';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export default class Viz10 extends AbstractViz {

    constructor() {
        super('10');

        this.kickBg = 0.0;
        this.kickBoost = 0.0;
    }

    initBackground() {
        super.initBackground();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };
        uniforms.uModA = { value: 0 };
        uniforms.uModB = { value: 0 };
        uniforms.uBoost = { value: 0 };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        uniforms.uWireframe = { value: 0 };

        this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // background
        const elapsed = (Date.now() - this.startTime) * 0.001;
        const factor = (this.kickBg + 1) * Math.pow(1, AppAudio.getValue(5) * 10) + elapsed;

        this.bg.material.uniforms.uTime.value = factor;

        // this.kickBg *= 0.98;
        
        this.kickBoost *= 0.98;
        this.bg.material.uniforms.uBoost.value = this.kickBoost;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.bg.material.uniforms.uModA.value = Math.floor(random(1.9));
            this.kickBg += 6.5;
            this.kickBoost += random(e.value);
        }

        if (e.index === 2) {
            this.bg.material.uniforms.uModB.value = Math.floor(random(1.9));
            // this.kickBg += 4.5;
        }
    }
}
