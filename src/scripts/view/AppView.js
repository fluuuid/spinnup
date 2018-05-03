import { WebGLRenderer } from 'three';
import TweenMax from 'gsap';
import Sketch from 'sketch-js';

import AppAudio from '../audio/AppAudio';
import WebGLView from './webgl/WebGLView';
import UIView from './ui/UIView';

class AppView {

    constructor() {
        this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
        this.audio = AppAudio;

        this.initSketch();
    }

    initSketch() {
        this.sketch = Sketch.create({
            type: Sketch.WEBGL,
            element: this.renderer.domElement,
            context: this.renderer.context,
            autopause: false,
            retina: (window.devicePixelRatio >= 2),
            fullscreen: true
        });

        this.sketch.setup = () => {
            this.initWebGL();
            this.initUI();
        };

        this.sketch.update = () => {
            // this.ui.stats.begin();
            this.audio.update();
            this.webgl.update();
        };

        this.sketch.draw = () => {
            this.ui.draw();
            this.webgl.draw();
            // this.ui.stats.end();
        };

        this.sketch.resize = () => {
            this.webgl.resize();
        };

        this.sketch.touchstart = () => {
            const touch = this.sketch.touches[0];
        };

        this.sketch.touchmove = () => {
        };

        this.sketch.touchend = () => {
        };

        this.sketch.keyup = (e) => {
            if (e.keyCode == 71) { // g
                this.ui.toggle();
            }

            if (e.keyCode === 32) { // space
                if (this.audio.paused) this.audio.play();
                else this.audio.pause();
            }
        };
    }

    initWebGL() {
        // move canvas to container
        document.querySelector('#container').appendChild(this.renderer.domElement);

        this.webgl = new WebGLView();
    }

    initUI() {
        this.ui = new UIView();
    }
}

export default new AppView();
