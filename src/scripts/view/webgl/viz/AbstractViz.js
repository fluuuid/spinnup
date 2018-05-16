import {
    BufferGeometry,
    BufferAttribute,
    Float32BufferAttribute,
    LinearFilter,
    Mesh,
    Object3D,
    PlaneBufferGeometry,
    RGBFormat,
    ShaderMaterial,
    Texture,
    Vector2,
} from 'three';

import AsyncPreloader from 'async-preloader';

import glsl from '../../../utils/glsl';

import AppAudio from '../../../audio/AppAudio';

export default class AbstractViz {

    constructor(id) {
        this.id = id;

        this.startTime = Date.now();
        this.object3D = new Object3D();

        this.initAudio();
        this.initBackground();
        this.initLogo();
    }

    initAudio() {
        AppAudio.on('audio:peak', this.onAudioPeak.bind(this));
    }

    initBackground(textureId) {
        const uniforms = {
            uTexture: { value: this.getTexture('texture') },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl(`default.frag`),
            uniforms,
        });

        const geometry = new PlaneBufferGeometry(1, 1);
        const mesh = new Mesh(geometry, material);

        this.bg = mesh;
        this.object3D.add(this.bg);
    }

    initLogo() {
        const uniforms = {
            uTexture: { value: this.getTexture('logo') },
        };

        const material = new ShaderMaterial({
            vertexShader: glsl(`default.vert`),
            fragmentShader: glsl(`default.frag`),
            uniforms,
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

        const equaliser = new Float32Array(geometry.attributes.position.count);
        geometry.addAttribute('equaliser', new BufferAttribute(equaliser, 1));
        
        const mesh = new Mesh(geometry, material);

        this.logo = mesh;
        this.object3D.add(this.logo);
        this.segments = segments;
    }

    getTexture(id) {
        const texture = new Texture(AsyncPreloader.items.get(id));
        texture.minFilter = LinearFilter;
        texture.magFilter = LinearFilter;
        texture.format = RGBFormat;
        texture.needsUpdate = true;

        return texture;
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // override
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize(bgAspect = 2) {
        // const bgAspect = 2;
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

        const logoScale = (screenAspect > 1) ? 0.5 : 0.8;

        this.logo.scale.x = window.innerWidth * logoScale;
        this.logo.scale.y = this.logo.scale.x / logoAspect;
    }

    onAudioPeak(e) {
        // override
    }
}
