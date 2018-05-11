import {
    BufferGeometry,
    BufferAttribute,
    Float32BufferAttribute,
    LinearFilter,
    Mesh,
    MeshBasicMaterial,
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

        const positions = [];
        const indices = [];
        const uvs = [];
        // const cols = [0.000, 0.164, 0.302, 0.354, 0.516, 0.676, 0.830, 1.000];
        const cols = [0.000, 0.164, 0.302, 0.472, 0.560, 0.676, 0.830, 1.000];
        const segments = new Vector2(cols.length - 1, 8);

        for (let i = 0; i <= segments.y; i++) {
            const y = (i / segments.y) - 0.5;
            for (let j = 0; j <= segments.x; j++) {
                const x = cols[j] - 0.5;
                positions.push(x, -y, 0);
                uvs.push(cols[j]);
                uvs.push(1 - (i / segments.y));
            }
        }

        for (let i = 0; i < segments.y; i ++) {
            for (let j = 0; j < segments.x; j ++) {
                let a = i * (segments.x + 1) + (j + 1);
                let b = i * (segments.x + 1) + j;
                let c = (i + 1) * (segments.x + 1) + j;
                let d = (i + 1) * (segments.x + 1) + (j + 1);
                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        const geometry = new BufferGeometry();
        geometry.setIndex(indices);
        geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
        geometry.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

        // const geometry = new PlaneBufferGeometry(1, 1, segments.x, segments.y);
        const equaliser = new Float32Array(geometry.attributes.position.count);
        geometry.addAttribute('equaliser', new BufferAttribute(equaliser, 1));
        
        const mesh = new Mesh(geometry, material);

        this.logo = mesh;
        this.object3D.add(this.logo);
        this.segments = segments;
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
