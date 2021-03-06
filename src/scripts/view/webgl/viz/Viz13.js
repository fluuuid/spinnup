import { LinearFilter, RGBFormat, Texture, Vector2 } from 'three';

import glsl from '../../../utils/glsl';
// import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz13 extends AbstractViz {

    constructor(id) {
        super(id);

        this.kickBg = 0.0;
        this.accBg = 0.0;
        this.velBg = 0.0;
    }

    initAudio() {
        super.initAudio();

        AppView.ui.audioSmoothing = 0.5;
        AppView.ui.audioPeakDecay = 0.93;
        AppView.ui.audioPeakInterval = 36;
        AppView.ui.audioPeakCutOff = 0.32;
        AppView.ui.onAudioChange();
        // AppView.ui.controlKit.update();
    }

    initBackground() {
        super.initBackground();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };
        uniforms.uModA = { value: new Vector2(0, 0) };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
    }

    initLogo() {
        super.initLogo();

        this.initDataBuffer();

        const uniforms = this.logo.material.uniforms;
        uniforms.uTime = { value: 0 };
        uniforms.uData = { value: this.dataTexture };
        uniforms.uDataLength = { value: this.data.length };
        uniforms.uWireframe = { value: 0 };

        this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
    }

    initDataBuffer() {
        // this.dataLevels = [12, 8, 16, 2, 22, 6, 14, 10];
        this.dataLevels = [4, 8, 10, 4, 8, 12, 4, 14];
        this.data = [];
        this.dataVel = [];
        this.dataAcc = [];
        
        for (let i = 0; i < this.dataLevels.length; i++) {
            this.data.push(0.0);
            this.dataVel.push(0.0);
            this.dataAcc.push(0.0);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.dataLevels.length;
        canvas.height = 2;

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
        this.velBg += this.accBg;
        this.accBg *= 0.95;

        const elapsed = (Date.now() - this.startTime) * 0.001;
        const factor = (this.kickBg + 1) * Math.pow(1, AppAudio.getValue(5) * 10) + elapsed + this.velBg;

        this.bg.material.uniforms.uTime.value = factor;

        this.logo.material.uniforms.uTime.value = elapsed;

        // data
        for (let i = 0; i < this.data.length; i++) {
            this.dataVel[i] += this.dataAcc[i];
            this.dataAcc[i] *= 0.8;
            this.dataVel[i] *= 0.95;
            this.data[i] = this.dataVel[i];
        }

        this.drawData();
    }

    drawData() {
        const ctx = this.dataBuffer;
        const h = ctx.canvas.height;
        
        for (let i = 0; i < this.data.length; i++) {
            const value = this.data[i];
            const round = Math.round(value * 255);
            ctx.fillStyle = `rgb(${round}, ${round}, ${round})`;
            ctx.fillRect(i, 0, 1, h);
        }

        this.dataTexture.needsUpdate = true;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.kickBg += 6.5;
            this.accBg += e.value * 0.1;
        }

        for (let i = 0; i < this.dataLevels.length; i++) {
            const level = this.dataLevels[i];
            if (e.index !== level) continue;
            this.dataAcc[i] += e.value * 0.1;
        }
    }
}
