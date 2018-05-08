import AppAudio from '../audio/AppAudio';
import WebGLView from './webgl/WebGLView';
import UIView from './ui/UIView';

class AppView {

    constructor() {
        this.audio = AppAudio;
    }

    init() {
        this.initWebGL();
        this.initUI();
        this.onResize();
        this.animate();

        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    initWebGL() {
        this.webgl = new WebGLView();

        // move canvas to container
        document.querySelector('#container').appendChild(this.webgl.renderer.domElement);
    }

    initUI() {
        this.ui = new UIView();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.update();
        this.draw();
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // this.ui.stats.begin();
        this.audio.update();
        this.webgl.update();
    }

    draw() {
        this.ui.draw();
        this.webgl.draw();
        // this.ui.stats.end();
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onResize() {
        this.webgl.resize();
    }

    onKeyUp(e) {
        if (e.keyCode == 71) { // g
            this.ui.toggle();
        }

        if (e.keyCode === 32) { // space
            if (this.audio.paused) this.audio.play();
            else this.audio.pause();
        }
    }
}

export default new AppView();
