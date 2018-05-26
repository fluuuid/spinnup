import { RepeatWrapping, Vector2 } from 'three';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz10 extends AbstractViz {

    constructor(id) {
        super(id);

        this.kickBg = 0.0;
        this.kickBoost = 0.0;
        this.kickOffsetLevel = 18;
        this.kickOffsetX = 0.0;
        this.kickOffsetY = 0.0;
        this.dampOffsetX = 0.92;
    }

    initAudio() {
        super.initAudio();

        AppView.ui.audioSmoothing = 0.8;
        AppView.ui.audioPeakDecay = 0.92;
        AppView.ui.audioPeakInterval = 22;
        AppView.ui.audioPeakCutOff = 0.59;
        AppView.ui.onAudioChange();
        AppView.ui.controlKit.update();
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
        uniforms.uSteps = { value: new Vector2(16, 2) };
        uniforms.uOffset = { value: new Vector2(0.002, 0.01) };
        uniforms.uGapSize = { value: 2.2 };
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

        this.kickOffsetX *= this.dampOffsetX;
        this.logo.material.uniforms.uOffset.value.x = this.kickOffsetX + 0.002;
        this.logo.material.uniforms.uOffset.value.y *= 0.95;

        this.kickOffsetY *= 0.92;
        if (this.kickOffsetLevel) {
            const value = AppAudio.getValue(this.kickOffsetLevel);
            const amount = Math.sin(value * Math.PI * 0.5) * 0.15;
            this.logo.material.uniforms.uOffset.value.y = amount + this.kickOffsetY;
        }
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.bg.material.uniforms.uModA.value = Math.floor(random(1.9));
            this.kickBg += 6.5;
            this.kickBoost += random(e.value);

            if (AppView.ui.vizLogoOverride) return;

            const rnd = Math.floor(random(3.8));

            this.dampOffsetX = 0.92;
            this.kickOffsetLevel = 18;

            switch (rnd) {
                case 0: {
                    this.logo.material.uniforms.uSteps.value.set(7, 2);
                    this.logo.material.uniforms.uGapSize.value = 0.50;
                    this.kickOffsetX = 0.00;
                    break;
                }
                case 1: {
                    this.logo.material.uniforms.uSteps.value.set(15, 2);
                    this.logo.material.uniforms.uGapSize.value = 2.9;
                    this.kickOffsetX = 0.02;
                    break;
                }
                case 2: {
                    this.logo.material.uniforms.uSteps.value.set(20, 2);
                    this.logo.material.uniforms.uGapSize.value = 4.50;
                    this.kickOffsetX = 0.0;
                    this.kickOffsetY -= 0.2;
                    break;
                }
                case 3: {
                    this.logo.material.uniforms.uSteps.value.set(12, 2);
                    this.logo.material.uniforms.uGapSize.value = 8.00;
                    this.kickOffsetX = 0.0;
                    this.kickOffsetY += 0.2;
                    break;
                }
            }
        }

        if (e.index === 2) {
            this.bg.material.uniforms.uModB.value = Math.floor(random(1.9));
            // this.kickBg += 4.5;
        }

        if (AppView.ui.vizLogoOverride) return;

        if (e.index === 22) {
            this.kickOffsetLevel = 30;
            this.logo.material.uniforms.uSteps.value.set(40, 2);
            this.logo.material.uniforms.uGapSize.value = 2.0;
            this.kickOffsetX = 0.0;
            this.kickOffsetY += 0.05;
            // this.dampOffsetX = 0.87;
        }

    }
}
