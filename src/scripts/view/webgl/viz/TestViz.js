import {
    LinearFilter,
    Mesh,
    Object3D,
    PlaneGeometry,
    RGBFormat,
    ShaderMaterial,
    Texture,
    Vector2,
} from 'three';

import AsyncPreloader from 'async-preloader';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export default class TestViz {

    constructor() {
        this.startTime = Date.now();
        this.object3D = new Object3D();

        this.initAudio();
        this.initBackground();
        this.initLogo();
    }

    initAudio() {
        this.kickBg = 0.0;
        this.kickRows = 0.0;
        this.kickStripes = 0.0;
        this.kickRowDamp = 0.95;

        AppAudio.on('audio:peak', this.onAudioPeak.bind(this));
    }

    initBackground() {
        const texture = new Texture(AsyncPreloader.items.get('Texture_06'));
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        const uniforms = {
            uTime: { value: 0 },
            uKnobA: { value: 1 },
            uKnobB: { value: 1 },
            uKnobC: { value: 0.5 },
            uTexture: { value: texture },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl('warping.frag'),
            uniforms,
            // wireframe: true,
        });

        const geometry = new PlaneGeometry(1, 1);
        const mesh = new Mesh(geometry, material);

        this.bg = mesh;
        this.object3D.add(this.bg);
    }

    initLogo() {
        const texture = new Texture(AsyncPreloader.items.get('logo'));
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        const uniforms = {
            uRows: { value: 10 },
            uCols: { value: 20 },
            uDisplacement: { value: 0 },
            uKnobD: { value: 0 },
            uTexture: { value: texture },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl('logo.frag'),
            uniforms,
            // wireframe: true,
            transparent: true,
        });

        const geometry = new PlaneGeometry(1, 1);
        const mesh = new Mesh(geometry, material);

        this.logo = mesh;
        this.object3D.add(this.logo);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        const level = AppAudio.getValue(5);
        const elapsed = (Date.now() - this.startTime) * 0.001;
        const intensity = 1;
        const factor = (this.kickBg + 1) * Math.pow(intensity, level * 10) + elapsed;

        this.bg.material.uniforms.uTime.value = factor;

        this.kickRows *= this.kickRowDamp;
        this.logo.material.uniforms.uRows.value = 2 + this.kickRows;

        // this.logo.material.uniforms.uKnobD.value = AppAudio.getValue(8) * 0.01;
        this.kickStripes *= 0.95;
        this.logo.material.uniforms.uKnobD.value = this.kickStripes;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize() {
        const bgAspect = 2;
        const logoAspect = 4;
        const screenAspect = window.innerWidth / window.innerHeight;

        // portrait
        if (screenAspect < bgAspect) {
            this.bg.scale.y = window.innerHeight;
            this.bg.scale.x = window.innerHeight * bgAspect;
        // landscape
        } else {
            this.bg.scale.x = window.innerWidth;
            this.bg.scale.y = window.innerWidth / bgAspect;
        }

        this.logo.scale.x = window.innerWidth * 0.5;
        this.logo.scale.y = this.logo.scale.x / logoAspect;
    }

    onAudioPeak(e) {
        if (e.index === 18) {
            this.bg.material.uniforms.uKnobA.value = random(0.6, 1.0);
            this.bg.material.uniforms.uKnobB.value = random(0.6, 1.2);
            this.bg.material.uniforms.uKnobC.value = random(0.35, 0.5);

            this.kickBg += 0.4;
        }


        if (e.index === 24) {
            this.logo.material.uniforms.uDisplacement.value = 2;
            this.kickStripes += e.value * 0.02;
            this.kickRows = random(4, 16);
            this.kickRowDamp = 0.99;
        }

        if (e.index === 2) {
            this.logo.material.uniforms.uDisplacement.value = 1;
            this.kickRows = random(4, 8);
            this.kickRowDamp = 0.98;
        }

        if (e.index === 18) {
            this.logo.material.uniforms.uDisplacement.value = 3;
            this.kickStripes += e.value * 0.01;
            this.kickRows = random(2, 48);
            this.kickRowDamp = 1.0;
        }
    }
}
