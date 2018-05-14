import { LinearFilter, RGBFormat, Texture, Vector2 } from 'three';

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

        this.initStrengthBuffer();

        const uniforms = this.logo.material.uniforms;
        uniforms.uTime = { value: 0 };
        // uniforms.uStrength = { value: 0 };
        uniforms.uStrength = { value: this.strengthTexture };

        // this.logo.material.vertexShader = glsl(`${this.id}/logo.vert`);
        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
    }

    initStrengthBuffer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 8;
        canvas.height = 1;

        const texture = new Texture(canvas);
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        this.strengthBuffer = ctx;
        this.strengthTexture = texture;

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

        this.drawStrength();
    }

    drawStrength() {
        const ctx = this.strengthBuffer;
        const h = ctx.canvas.height;
        const values = [0.0, 0.2, 0.2, 0.0, 0.0, 0.2, 0.0, 0.4];
        
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            ctx.fillStyle = `rgb(${value * 255}, ${value * 255}, ${value * 255})`;
            ctx.fillRect(i, 0, 1, h);
        }

        this.strengthTexture.needsUpdate = true;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        if (e.index === 6) {
            this.kickBg += 6.5;
            this.accBg += e.value * 0.1;
        }
    }
}
