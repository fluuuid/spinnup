import { RepeatWrapping, Vector2 } from 'three';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export default class Viz10 extends AbstractViz {

    constructor() {
        super('10');

        this.equaliserLevels = [];
        this.equaliserLevels.push([4, 8, 2, 16, 12, 4, 18, 24]);
        this.equaliserLevels.push([22, 7, 11, 3, 9, 10, 13, 4]);
        this.equaliserLevels.push([9, 17, 5, 18, 23, 30, 1, 16]);

        this.equaliserIndex = 0;

        this.kickBg = 0.0;
        this.kickRows = 0.0;
        this.kickDisplace = 0.0;
        this.kickRowDamp = 0.95;
    }

    initBackground() {
        super.initBackground();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        uniforms.uRows = { value: 10 };
        uniforms.uCols = { value: 20 };
        uniforms.uDisplaceType = { value: 0 };
        uniforms.uDisplaceIntensity = { value: 0 };
        uniforms.uWireframe = { value: 0 };

        // this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // background
        const elapsed = (Date.now() - this.startTime) * 0.001;
        const factor = (this.kickBg + 1) * Math.pow(1, AppAudio.getValue(5) * 10) + elapsed;

        this.bg.material.uniforms.uTime.value = elapsed;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {

    }
}
