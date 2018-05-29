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
    }

    initAudio() {
        super.initAudio();

        AppView.ui.audioSmoothing = 0.97;
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
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        uniforms.uSteps = { value: new Vector2(2, 6) };
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
        }
    }
}
