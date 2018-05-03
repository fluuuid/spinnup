import {
    Scene,
    OrthographicCamera,
    BoxGeometry,
    ShaderMaterial,
    Mesh,
} from 'three';
import glsl from '../../utils/glsl';

import AppAudio from '../../audio/AppAudio';
import AppView from '../../view/AppView';
import TestViz from './viz/TestViz';

export default class WebGLView {

    constructor() {
        this.view = AppView;
        this.audio = AppAudio;
        this.renderer = this.view.renderer;

        this.initThree();
        this.initViz();
    }

    initThree() {
        // scene
        this.scene = new Scene();

        // orthographic camera
        this.hw = window.innerWidth * 0.5;
        this.hh = window.innerHeight * 0.5;
        this.camera = new OrthographicCamera(-this.hw, this.hw, this.hh, -this.hh, -10000, 10000);
        this.camera.position.z = 10;
    }

    initViz() {
        this.viz = new TestViz();
        this.scene.add(this.viz.object3D);
    }

    initObject() {
        const geometry = new BoxGeometry(100, 100, 100);

        const material = new ShaderMaterial({
            uniforms: {},
            vertexShader: glsl('default.vert'),
            fragmentShader: glsl('default.frag'),
            wireframe: true
        });

        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);

        this.mesh = mesh;
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        this.viz.update();
    }

    draw() {
        this.renderer.render(this.scene, this.camera);
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    resize() {
        if (!this.renderer) return;

        // orthographic camera
        this.hw = window.innerWidth * 0.5;
        this.hh = window.innerHeight * 0.5;

        this.camera.left = -this.hw;
        this.camera.right = this.hw;
        this.camera.top = this.hh;
        this.camera.bottom = -this.hh;
        this.camera.updateProjectionMatrix();

        this.viz.resize();

        this.renderer.setSize(this.view.sketch.width, this.view.sketch.height);
    }
}
