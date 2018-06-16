import EventEmitter from 'events';

import AppAudio from './AppAudio';
import AudioLevel from './AudioLevel';

export default class DOMAudio extends EventEmitter {

    get paused() { return this.el.paused; }
    get currentTime() { return this.el.currentTime; }
    get duration() { return this.el.duration; }
    get levelsCount() { return 32; }

    constructor() {
        super();

        this.el = document.createElement('audio');
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    decode(arrayBuffer, src, cb) {
        this.el.setAttribute('src', src);
    }

    play() {
        this.el.play();   
    }

    pause() {
        this.el.pause();
    }

    stop() {
        this.el.pause();
    }

    seek(time) {
        
    }

    mute() {
        
    }

    unmute() {
        
    }

    update() {
        
    }

    getLevel(index) {
        return 0;
    }

    getValue(index) {
        return 0;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onSourceEnded() {
        
    }
}

