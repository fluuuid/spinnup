import {
    BufferAttribute,
    LinearFilter,
    Mesh,
    Object3D,
    PlaneGeometry,
    PlaneBufferGeometry,
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
        this.initDisplacement();
    }

    initAudio() {
        this.kickBg = 0.0;
        this.kickRows = 0.0;
        this.kickDisplace = 0.0;
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
            uModA: { value: 1 },
            uModB: { value: 1 },
            uModC: { value: 0.5 },
            uDebug: { value: 0 },
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
            uDisplaceType: { value: 0 },
            uDisplaceIntensity: { value: 0 },
            uWireframe: { value: 0 },
            uTexture: { value: texture },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('logo.vert'),
            fragmentShader: glsl('logo.frag'),
            uniforms,
            // wireframe: true,
            transparent: true,
        });

        this.segments = new Vector2(7, 2);

        const geometry = new PlaneBufferGeometry(1, 1, this.segments.x, this.segments.y);
        const equaliser = new Float32Array(geometry.attributes.position.count);
        geometry.addAttribute('equaliser', new BufferAttribute(equaliser, 1));
        
        const mesh = new Mesh(geometry, material);

        this.logo = mesh;
        this.object3D.add(this.logo);
    }

    initDisplacement() {
        this.equaliserLevels = [];
        this.equaliserLevels.push([4, 8, 2, 16, 12, 4, 18, 24]);
        this.equaliserLevels.push([22, 7, 11, 3, 9, 10, 13, 4]);
        this.equaliserLevels.push([9, 17, 5, 18, 23, 30, 1, 16]);

        this.equaliserIndex = 0;
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
        this.kickDisplace *= 0.95;
        if (AppView.ui.vizLogoDisplace) this.kickDisplace = AppView.ui.vizLogoDisplace;
        this.logo.material.uniforms.uDisplaceIntensity.value = this.kickDisplace;

        // logo equaliser
        const levels = this.equaliserLevels[this.equaliserIndex];
        const equaliser = this.logo.geometry.attributes.equaliser.array;

        for (let i = 0; i < equaliser.length; i++) {
            const x = i % (this.segments.x + 1);
            const y = Math.floor(i / (this.segments.x + 1));
            
            const level = levels[x % levels.length];
            const intensity = 1 - (y / this.segments.y);

            equaliser[i] = Math.sin(AppAudio.getValue(level) * Math.PI * 1.5) * 0.25 * intensity;
            if (!AppView.ui.vizLogoEqualiser) equaliser[i] = 0;
        }

        this.logo.geometry.attributes.equaliser.needsUpdate = true;
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
            this.bg.material.uniforms.uModA.value = random(0.6, 1.0);
            this.bg.material.uniforms.uModB.value = random(0.6, 1.2);
            this.bg.material.uniforms.uModC.value = random(0.35, 0.5);

            this.kickBg += 0.4;
        }

        if (e.index === 24) {
            this.logo.material.uniforms.uDisplaceType.value = 2;
            this.kickDisplace += e.value * 0.02;
            this.kickRows = random(4, 16);
            this.kickRowDamp = 0.99;
        }

        if (e.index === 2) {
            this.logo.material.uniforms.uDisplaceType.value = 1;
            this.kickRows = random(4, 8);
            this.kickRowDamp = 0.98;
        }

        if (e.index === 18) {
            this.logo.material.uniforms.uDisplaceType.value = 3;
            this.kickDisplace += e.value * 0.005;
            this.kickRows = random(2, 24);
            this.kickRowDamp = 1.02;

            this.equaliserIndex++;
            if (this.equaliserIndex > this.equaliserLevels.length - 1) this.equaliserIndex = 0;
        }

        if (AppView.ui.vizLogo !== 0) this.logo.material.uniforms.uDisplaceType.value = AppView.ui.vizLogo;
    }
}
