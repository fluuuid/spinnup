import {
    LinearFilter,
    RGBFormat,
    Texture,
    Vector2,
} from 'three';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz11 extends AbstractViz {

    constructor(id) {
        super(id);

        this.kickBg = 0.0;
        this.kickOffsetLevel = 18;
        this.kickOffsetX = 0.0;
    }

    initAudio() {
        super.initAudio();

        AppView.ui.audioSmoothing = 0.9;
        AppView.ui.audioPeakCutOff = 0.45;
        AppView.ui.onAudioChange();
        AppView.ui.controlKit.update();
    }

    initBackground() {
        super.initBackground();

        this.initDataBuffer();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };
        uniforms.uTimeRoll = { value: 0 };
        uniforms.uModA = { value: 0 };
        uniforms.uModB = { value: 0 };
        uniforms.uData = { value: this.dataTexture };
        uniforms.uDataLength = { value: this.dataBuffer.canvas.width };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
        // this.bg.visible = false;
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        uniforms.uSteps = { value: new Vector2(2, 2) };
        uniforms.uOffset = { value: new Vector2(0.005, 0.01) };
        uniforms.uGapSize = { value: 2.2 };
        uniforms.uWireframe = { value: 0 };

        this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
        // this.logo.visible = false;
    }

    initDataBuffer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = AppAudio.levelsCount;
        canvas.height = 1;

        const texture = new Texture(canvas);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        this.dataBuffer = ctx;
        this.dataTexture = texture;

        /*
        // DEBUG
        canvas.style.position = 'absolute';
        canvas.style.left = 10;
        canvas.style.top = 10;
        document.querySelector('body').appendChild(canvas);
        */
    }


    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // background
        // const elapsed = (Date.now() - this.startTime) * 0.001;
        const elapsed = AppAudio.currentTime * 0.001;
        const factor = (this.kickBg + 1) * Math.pow(1, AppAudio.getValue(5) * 10) + elapsed;

        this.bg.material.uniforms.uTime.value = (Date.now() - this.startTime) * 0.001;
        this.bg.material.uniforms.uTimeRoll.value = factor;

        this.bg.material.uniforms.uModA.value *= 0.85;
        // this.bg.material.uniforms.uModB.value *= 0.95;

        this.drawData(elapsed);

        this.kickOffsetX *= 0.92;
        if (this.kickOffsetLevel) {
            const value = AppAudio.getValue(this.kickOffsetLevel);
            const amount = Math.sin(value * Math.PI * 0.5) * 0.008;
            this.logo.material.uniforms.uOffset.value.x = amount + this.kickOffsetX;
        }
    }

    drawData(t) {
        const ctx = this.dataBuffer;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;

        for (let i = 0; i < AppAudio.levelsCount; i++) {
            const value = AppAudio.getValue(i);
            ctx.fillStyle = `rgb(${value * 255}, 0.0, 0.0)`;
            ctx.fillRect(i, 0, 1, h);    
        }

        this.dataTexture.needsUpdate = true;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize() {
        super.resize(1.414);
    }

    onAudioPeak(e) {
        if (e.index === 18) {
            this.bg.material.uniforms.uModA.value = 1.0;
            this.kickBg += 0.4;
        }

        if (e.index === 12) {
            this.bg.material.uniforms.uModB.value = random();

            if (AppView.ui.vizLogoOverride) return;

            const rnd = Math.floor(random(0.8));

            this.dampOffsetX = 0.92;
            this.kickOffsetLevel = 6;

            const sign = (random() > 0.5) ? 1 : -1;

            switch (rnd) {
                case 0: {
                    this.logo.material.uniforms.uSteps.value.set(2, Math.floor(random(3, 7)));
                    this.logo.material.uniforms.uOffset.value.y = 0.01;
                    this.logo.material.uniforms.uGapSize.value = random(0.5, 5.2);
                    this.kickOffsetX += 0.15 * sign; 
                    break;
                }
                /*
                case 1: {
                    this.logo.material.uniforms.uSteps.value.set(3, Math.floor(random(14, 22)));
                    this.logo.material.uniforms.uOffset.value.y = 0.15;
                    this.logo.material.uniforms.uGapSize.value = 1.50;
                    this.kickOffsetX -= 0.015;
                    break;
                }
                case 2: {
                    this.logo.material.uniforms.uSteps.value.set(3, 4);
                    this.logo.material.uniforms.uOffset.value.y = 0.004;
                    this.logo.material.uniforms.uGapSize.value = 3.20;
                    this.kickOffsetX += 0.015;
                    break;
                }
                case 3: {
                    this.logo.material.uniforms.uSteps.value.set(2, Math.floor(random(12, 28)));
                    this.logo.material.uniforms.uOffset.value.y = 0.001;
                    this.logo.material.uniforms.uGapSize.value = 3.50;
                    this.kickOffsetX += 0.015;
                    break;
                }
                */
            }
        }
    }
}
