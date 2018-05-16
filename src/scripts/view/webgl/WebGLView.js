import {
    OrthographicCamera,
    Scene,
    WebGLRenderer
} from 'three';

import AppAudio from '../../audio/AppAudio';
import AppView from '../../view/AppView';
import * as Viz from './viz';

export default class WebGLView {

    constructor() {
        this.view = AppView;
        this.audio = AppAudio;

        this.initThree();
    }

    initThree() {
        // scene
        this.scene = new Scene();

        // orthographic camera
        this.hw = window.innerWidth * 0.5;
        this.hh = window.innerHeight * 0.5;
        this.camera = new OrthographicCamera(-this.hw, this.hw, this.hh, -this.hh, -10000, 10000);
        this.camera.position.z = 10;

        // renderer
        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.autoClear = false;
    }

    init(vizId) {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        this.viz = new Viz[vizId](vizId);
        this.scene.add(this.viz.object3D);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        this.viz.update();
    }

    draw() {
        this.renderer.clear();
        this.renderer.render(this.scene, this.camera);
        if (this.viz.scene) this.renderer.render(this.viz.scene, this.viz.camera);
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

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
