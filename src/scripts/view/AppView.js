import AppAudio from '../audio/AppAudio';
import WebGLView from './webgl/WebGLView';
import UIView from './ui/UIView';

class AppView {

    constructor() {
        this.audio = AppAudio;
        this.animate = this.animate.bind(this);

        this.initUI();
        this.initWebGL();

        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        document.querySelector('#container').addEventListener('click', this.onClick.bind(this));
    }

    init(vizId) {
        this.kill();
        this.webgl.init(vizId);
        this.ui.init(this, vizId);
        this.onResize();
        this.animate();
    }

    initWebGL() {
        this.webgl = new WebGLView();
        this.onResize();

        // move canvas to container
        document.querySelector('#container').appendChild(this.webgl.renderer.domElement);
    }

    kill() {
        cancelAnimationFrame(this.raf);
    }

    initUI() {
        this.ui = new UIView();
    }

    animate() {
        this.update();
        this.draw();

        // bind functions at contructor level
        // if you have a bind inside a loop, the browser creates a new bind function on every loop
        // also, rAf should be called after update/draw in order to avoid overlapping frames
        this.raf = requestAnimationFrame(this.animate);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    update() {
        // this.ui.stats.begin();
        this.audio.update();
        if(this.webgl) this.webgl.update();
    }

    draw() {
        this.ui.draw();
        if(this.webgl) this.webgl.draw();
        // this.ui.stats.end();
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onResize() {
        if(this.webgl) this.webgl.resize();
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

    onClick() {
        if (this.audio.context.state === 'suspended') {
            this.audio.context.resume();
            return;
        }
        if (this.audio.paused) this.audio.play();
        else this.audio.pause();
    }
}

export default new AppView();
