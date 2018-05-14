import { Vector2 } from 'three';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz13 extends AbstractViz {

    constructor() {
        super('13');

        this.kickBg = 0.0;
        this.accBg = 0.0;
        this.velBg = 0.0;
    }

    initBackground() {
        super.initBackground();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };
        // uniforms.uModA = { value: 0 };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        // uniforms.uSteps = { value: new Vector2(16, 2) };

        // this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // background
        const elapsed = (Date.now() - this.startTime) * 0.001;
        let factor = (this.kickBg + 1) * Math.pow(1, AppAudio.getValue(5) * 10) + elapsed;
        
        this.velBg += this.accBg;
        this.accBg *= 0.95;
        // this.velBg *= 0.99;

        factor += this.velBg;

        this.bg.material.uniforms.uTime.value = factor;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.kickBg += 6.5;
            this.accBg += e.value * 0.05;
        }
    }
}
