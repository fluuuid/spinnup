import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz06 extends AbstractViz {

    constructor(id) {
        super(id);

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
        uniforms.uModA = { value: 1 };
        uniforms.uModB = { value: 1 };
        uniforms.uModC = { value: 0.5 };
        uniforms.uDebug = { value: 0 };

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

        // logo rows
        this.kickRows *= this.kickRowDamp;
        this.logo.material.uniforms.uRows.value = 2 + this.kickRows;

        // logo fx
        this.kickDisplace *= 0.98;
        if (AppView.ui.vizLogoDisplace) this.kickDisplace = AppView.ui.vizLogoDisplace;
        this.logo.material.uniforms.uDisplaceIntensity.value = this.kickDisplace;

        // logo equaliser
        const levels = this.equaliserLevels[this.equaliserIndex];
        const equaliser = this.logo.geometry.attributes.equaliser.array;

        for (let i = 0; i < equaliser.length; i++) {
            const x = i % (this.segments.x + 1);
            const y = Math.floor(i / (this.segments.x + 1));

            const level = levels[x % levels.length];
            // const intensity = 1 - (y / this.segments.y); // just top
            const intensity = (y - this.segments.y / 2) / this.segments.y; // both top and bottom
            const scale = AppView.ui.vizLogoEqualiser;
            const value = AppAudio.getValue(level);

            // equaliser[i] = Math.sin(value * Math.PI * 1.8 * -Math.pow(Math.sin(value), 2)) * scale * intensity;
            equaliser[i] = Math.sin(value * Math.PI * 1.5) * scale * intensity;
        }

        this.logo.geometry.attributes.equaliser.needsUpdate = true;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 18) {
            this.bg.material.uniforms.uModA.value = random(0.6, 1.0);
            this.bg.material.uniforms.uModB.value = random(0.6, 1.2);
            this.bg.material.uniforms.uModC.value = random(0.35, 0.5);

            this.kickBg += 0.4;
        }

        // sawtooth
        if (e.index === 2) {
            this.logo.material.uniforms.uDisplaceType.value = 1;
            this.kickDisplace = e.value * 0.01;
            this.kickRows = random(4, 8);
            this.kickRowDamp = 0.98;
        }

        // sine
        if (e.index === 24) {
            this.logo.material.uniforms.uDisplaceType.value = 2;
            this.kickDisplace += e.value * 0.02;
            this.kickRows = random(4, 16);
            this.kickRowDamp = 0.99;
        }

        // quartic
        if (e.index === 18) {
            this.logo.material.uniforms.uDisplaceType.value = 3;
            this.kickDisplace = e.value * 0.01;
            this.kickRows = random(2, 24);
            this.kickRowDamp = 1.02;

            this.equaliserIndex++;
            if (this.equaliserIndex > this.equaliserLevels.length - 1) this.equaliserIndex = 0;
        }

        if (AppView.ui.vizLogo !== 0) this.logo.material.uniforms.uDisplaceType.value = AppView.ui.vizLogo;
    }
}
