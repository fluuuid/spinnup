import {
    Color,
    LinearFilter,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PointLight,
    RGBFormat,
    RGBAFormat,
    Scene,
    Texture,
    Vector2,
    WebGLRenderTarget,
} from 'three';

import GLTFLoader from 'imports-loader?THREE=three!exports-loader?THREE.GLTFLoader!threeX/loaders/GLTFLoader';

import CopyShader from 'imports-loader?THREE=three!exports-loader?THREE.CopyShader!threeX/shaders/CopyShader';
import SobelOperatorShader from 'imports-loader?THREE=three!exports-loader?THREE.SobelOperatorShader!threeX/shaders/SobelOperatorShader';

import EffectComposer from 'imports-loader?THREE=three!exports-loader?THREE.EffectComposer!threeX/postprocessing/EffectComposer';
import RenderPass from 'imports-loader?THREE=three!exports-loader?THREE.RenderPass!threeX/postprocessing/RenderPass';
import ShaderPass from 'imports-loader?THREE=three!exports-loader?THREE.ShaderPass!threeX/postprocessing/ShaderPass';

import AsyncPreloader from 'async-preloader';

import glsl from '../../../utils/glsl';
import { random } from '../../../utils/math.utils';

import AbstractViz from './AbstractViz';
import AppAudio from '../../../audio/AppAudio';
import AppView from '../../../view/AppView';

export class Viz07 extends AbstractViz {

    constructor(id) {
        super(id);

        this.kickBg = 0.0;
        this.accBg = 0.0;
        this.velBg = 0.0;

        this.initScene();
        this.initPostProcessing();
        this.initLogoGLTF();
    }

    initBackground() {
        super.initBackground();

        this.initDataBuffer();

        const uniforms = this.bg.material.uniforms;
        uniforms.uTime = { value: 0 };
        uniforms.uIntensity = { value: 1.0 };
        uniforms.uData = { value: this.dataTexture };
        uniforms.uAspect = { value: new Vector2(1.0, 1.0 / (4961 / 3508)) }; // original image size
        uniforms.uDataLength = { value: this.dataBuffer.canvas.width };
        uniforms.uLogoScale = { value: new Vector2(1, 1) };

        this.bg.material.fragmentShader = glsl(`${this.id}/bg.frag`);
        // this.bg.visible = false;
    }

    initLogo() {
        super.initLogo();

        const uniforms = this.logo.material.uniforms;
        uniforms.uWireframe = { value: 0 };

        this.logo.material.fragmentShader = glsl(`${this.id}/logo.frag`);
        this.logo.visible = false;
    }

    initDataBuffer() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1024;
        canvas.height = 100;

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

    initScene() {
        this.scene = new Scene();

        this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.z = 100;

        this.lightA = new PointLight();
        this.lightA.position.set(10, 50, 50);
        this.scene.add(this.lightA);
    }

    initPostProcessing() {
        // const params = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false };
        // const renderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, params );

        this.composer = new EffectComposer(AppView.webgl.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const sobelPass = new ShaderPass(SobelOperatorShader);
        sobelPass.needsSwap = false;
        this.composer.addPass(sobelPass);
        this.sobelPass = sobelPass;

        this.bg.material.uniforms.uLogoTexture = { value: this.composer.renderTarget1.texture };
    }

    initLogoGLTF() {
        const loader = new GLTFLoader();
        const buffer = AsyncPreloader.items.get('gltf');

        // const material = new MeshBasicMaterial({
        const material = new MeshStandardMaterial({
            color: 0xFFFFFF,
            // wireframe: true,
            // depthWrite: false,
        });

        loader.parse(buffer, null, (gltf) => {
            const group = gltf.scene.children[0];
            
            for (let i = 0; i < group.children.length; i++) {
                const mesh = group.children[i];
                mesh.material = material;
                mesh.scale.z = 1;
            }

            // align with logo
            group.rotation.set(0, 0, 0);
            // group.scale.multiplyScalar(648);
            group.scale.multiplyScalar(388);
            // group.scale.z = 1;

            this.gltf = group;
            this.scene.add(this.gltf);
            // console.log(gltf);
        });
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // background
        const elapsed = (Date.now() - this.startTime) * 0.001;
        this.bg.material.uniforms.uTime.value = elapsed;
        
        this.kickBg *= 0.95;
        this.bg.material.uniforms.uIntensity.value = this.kickBg;

        this.drawData(elapsed);

        if (!this.gltf) return;

        for (let i = 0; i < this.gltf.children.length; i++) {
            const mesh = this.gltf.children[i];
            const value = AppAudio.getValue(i) || 0;

            // mesh.rotation.x += value * 0.01;
            // mesh.rotation.y += value * 0.01;

            if (value) mesh.scale.z = value * 20;
            mesh.position.z = mesh.scale.z * 0.002;
        }

        this.gltf.rotation.x -= 0.01;
        this.gltf.rotation.z += 0.01;
    }

    drawData(t) {
        const ctx = this.dataBuffer;
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        const f = t * 30;
        const i = Math.floor(f % w);
        
        // const value = this.kickBg;
        const value = AppAudio.getValue(22);
        ctx.fillStyle = `rgb(${value * 255}, 0.0, 0.0)`;
        ctx.fillRect(i, 0, 1, h);

        this.dataTexture.needsUpdate = true;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize() {
        super.resize(1.414);

        // this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = this.bg.scale.x / this.bg.scale.y;
        this.camera.updateProjectionMatrix();

        this.composer.setSize(this.bg.scale.x, this.bg.scale.y);

        this.sobelPass.uniforms.resolution.value.x = this.bg.scale.x;
        this.sobelPass.uniforms.resolution.value.y = this.bg.scale.y;
    }

    onAudioPeak(e) {
        if (e.index === 16) {
            this.kickBg += e.value;
        }
    }
}
