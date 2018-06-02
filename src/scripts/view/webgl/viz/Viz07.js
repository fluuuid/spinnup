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
        this.velRotation = 0.0;
        this.rotateLetter = 0;
        this.rotateAll = 0;
        this.dataLevels = [4, 8, 10, 12, 5, 7, 9];
        this.letterScale = 20;

        this.initScene();
        this.initPostProcessing();
        this.initLogoGLTF();
    }

    initAudio() {
        super.initAudio();

        AppView.ui.audioSmoothing = 0.79;
        AppView.ui.audioPeakDecay = 0.92;
        AppView.ui.audioPeakInterval = 60;
        AppView.ui.audioPeakCutOff = 0.29;
        AppView.ui.onAudioChange();
        AppView.ui.controlKit.update();
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
        uniforms.uLogoScale = { value: new Vector2(0.5, 0.5) };

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

        this.lightA = new PointLight(0xFFFFFF, 2);
        this.lightA.position.set(10, 10, 100);
        this.scene.add(this.lightA);
    }

    initPostProcessing() {
        // const params = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBFormat, stencilBuffer: false };
        // const renderTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, params );

        this.composer = new EffectComposer(AppView.webgl.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        // renderPass.renderToScreen = true;
        this.composer.addPass(renderPass);

        const sobelPass = new ShaderPass(SobelOperatorShader);
        // sobelPass.renderToScreen = true;
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
                // mesh.scale.z = 1;

                // store rotation
                mesh.lastRotation = mesh.rotation.clone();
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

        this.velRotation *= 0.99;

        for (let i = 0; i < this.gltf.children.length; i++) {
            const mesh = this.gltf.children[i];
            // const value = AppAudio.getValue(i) || 0;
            const value = AppAudio.getValue(this.dataLevels[i]) || 0;

            if (this.rotateLetter === 1) mesh.rotation.x -= value * this.velRotation;
            if (this.rotateLetter === 2) mesh.rotation.y += value * this.velRotation;

            if (this.rotateLetter) mesh.lastRotation.copy(mesh.rotation);

            if (value) mesh.scale.z = value * this.letterScale + 2;
            // mesh.position.z = mesh.scale.z * 0.002;
        }

        if (this.rotateAll && AppView.ui.vizLogoRotateAll) {
            this.gltf.rotation.x -= 0.01;
            this.gltf.rotation.z += 0.001;
        }
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

        const logoScale = this.logo.scale.x / window.innerWidth;
        const scl = (logoScale > 0.5) ? 0.35 : 0.5;
        this.bg.material.uniforms.uLogoScale.value.set(scl, scl);
    }

    onAudioPeak(e) {
        if (e.index === 16) {
            this.kickBg += e.value;
        }

        if (e.index === 10) {
            const rnd = Math.floor(random(2.8));

            // reset letter rotation and scale
            this.rotateLetter = 0;
            this.letterScale = 20;

            for (let i = 0; i < this.gltf.children.length; i++) {
                const mesh = this.gltf.children[i];
                mesh.rotation.set(0, 0, 0);
            
                // update data levels
                this.dataLevels[i] = Math.floor(random(1, 22));
            }

            this.rotateAll = Math.round(random());

            switch (rnd) {
                case 0: {
                    this.gltf.rotation.set(random(-0.8, -1.2), 0.0, 0.4);
                    this.lightA.position.set(100, 150, 50);
                    break;
                }
                case 1: {
                    this.gltf.rotation.set(0, 0, 0);
                    this.lightA.position.set(10, 10, 100);
                    break;
                }
                case 2: {
                    this.gltf.rotation.set(0.4, random(-0.2, -0.8), 0.0);
                    this.lightA.position.set(-100, 20, 50);
                    break;
                }
                case 3: {
                    // this.rotateLetter = Math.floor(random(1, 2.9));
                    this.rotateLetter = 1;
                    this.velRotation = 0.08;
                    this.letterScale = random(3, 6);
                    for (let i = 0; i < this.gltf.children.length; i++) {
                        const mesh = this.gltf.children[i];
                        mesh.rotation.copy(mesh.lastRotation);
                        // mesh.scale.z = 2;
                    }
                    break;
                }
            }
            
        }
    }
}
