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
        this.kickOffsetLevel = 22;
        this.kickOffsetX = 0.0;
        this.kickOffsetY = 0.0;

        this.targetSteps = new Vector2(2, 2);
        this.targetOffset = new Vector2(0.1, 0.1);
        this.targetGap = 0.5;
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
        uniforms.uSteps = { value: new Vector2(16, 3) };
        uniforms.uOffset = { value: new Vector2(0.002, 0.0) };
        uniforms.uGapSize = { value: 0.5 };
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

        this.kickOffsetX *= 0.96;
        this.logo.material.uniforms.uOffset.value.x = this.kickOffsetX + 0.002;
        this.logo.material.uniforms.uOffset.value.y *= 0.95;

        this.kickOffsetY *= 0.92;
        if (this.kickOffsetLevel) {
            const value = AppAudio.getValue(this.kickOffsetLevel);
            const amount = Math.sin(value * Math.PI * 0.5) * 0.1;
            this.logo.material.uniforms.uOffset.value.y = amount + this.kickOffsetY;
        }

        // this.logo.material.uniforms.uSteps.value.x += (this.targetSteps.x - this.logo.material.uniforms.uSteps.value.x) * 0.5;
        // this.logo.material.uniforms.uSteps.value.y += (this.targetSteps.y - this.logo.material.uniforms.uSteps.value.y) * 0.5;
        // this.logo.material.uniforms.uOffset.value.x += (this.targetOffset.x - this.logo.material.uniforms.uOffset.value.x) * 0.5;
        // this.logo.material.uniforms.uOffset.value.y += (this.targetOffset.y - this.logo.material.uniforms.uOffset.value.y) * 0.5;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.bg.material.uniforms.uModA.value = Math.floor(random(1.9));
            this.kickBg += 6.5;
            this.kickBoost += random(e.value);

            const rnd = Math.floor(random(3.8));

            if (AppView.ui.vizLogoOverride) return;

            switch (rnd) {
                case 0: {
                    this.logo.material.uniforms.uSteps.value.set(5, 2);
                    this.logo.material.uniforms.uGapSize.value = 3.20;
                    this.kickOffsetX += 0.005;
                    break;
                }
                case 1: {
                    this.logo.material.uniforms.uSteps.value.set(16, 2);
                    // this.logo.material.uniforms.uGapSize.value = 2.14;
                    this.logo.material.uniforms.uGapSize.value = 0.5;
                    this.kickOffsetX += 0.1;
                    // this.kickOffsetX += 0.005;
                    break;
                }
                case 2: {
                    this.logo.material.uniforms.uSteps.value.set(25, 2);
                    this.logo.material.uniforms.uGapSize.value = 2.30;
                    this.kickOffsetY -= 0.2;
                    break;
                }
                case 3: {
                    this.logo.material.uniforms.uSteps.value.set(10, 3);
                    this.logo.material.uniforms.uGapSize.value = 3.20;
                    this.kickOffsetX += 0.005;
                    this.kickOffsetY += 0.2;
                    break;
                }
            }

            // this.logo.material.uniforms.uOffset.value.y += 0.05;
        }

        if (e.index === 2) {
            this.bg.material.uniforms.uModB.value = Math.floor(random(1.9));
            // this.kickBg += 4.5;
        }

        return;

        /*
        if (e.index === 8) {
            this.logo.material.uniforms.uSteps.value.set(31, 2);
            this.logo.material.uniforms.uGapSize.value = 1.30;
            this.kickOffsetLevel = 8;

            this.logo.material.uniforms.uOffset.value.y += 0.025;
        }

        if (e.index === 12) {
            return;
            this.logo.material.uniforms.uSteps.value.set(25, 2);
            this.logo.material.uniforms.uGapSize.value = 4.50;
            this.kickOffsetLevel = 12;

            this.logo.material.uniforms.uOffset.value.y += 0.025;
        }
        */

        if (e.index === 16) {
            this.logo.material.uniforms.uSteps.value.set(19, 2);
            this.logo.material.uniforms.uGapSize.value = 1.15;
            this.kickOffsetLevel = 16;

            this.logo.material.uniforms.uOffset.value.y += 0.025;
        }

        if (e.index === 22) {
            this.logo.material.uniforms.uSteps.value.set(16, 2);
            this.logo.material.uniforms.uGapSize.value = 0.8;
        }
    }
}
