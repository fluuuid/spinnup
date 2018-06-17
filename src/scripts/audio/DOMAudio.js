import EventEmitter from 'events';
import SimplexNoise from 'simplex-noise';

import AppAudio from './AppAudio';
import AudioLevel from './AudioLevel';

export default class DOMAudio extends EventEmitter {

    get paused() { return this.el.paused; }
    get ended() { return this.el.ended; }
    get currentTime() { return this.el.currentTime; }
    get duration() { return this.el.duration; }
    get levelsCount() { return 32; }

    constructor() {
        super();

        this.simplex = new SimplexNoise();

        this.levels = [];
        for (let i = 0; i < this.levelsCount; i++) { this.levels.push(new AudioLevel(i)); }

        this.el = document.createElement('audio');
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    decode(arrayBuffer, src, cb) {
        this.el.addEventListener('canplay', () => {
            if (cb) cb();
        });
        // this.el.addEventListener('ended', this.onSourceEnded.bind(this));
        this.el.setAttribute('src', src);
    }

    play() {
        this.el.play();
        this.emit(AppAudio.AUDIO_PLAY, { currentTime: this.currentTime });
    }

    pause() {
        this.el.pause();
        this.emit(AppAudio.AUDIO_PAUSE, { currentTime: this.currentTime });
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
        if (this.paused) return;
        if (this.ended) return;

        this.updateFrequencyData();
        this.detectPeak();
    }

    updateFrequencyData() {
        let t = 0;
        for (let i = 0; i < this.levelsCount; i++) {
            t = Date.now() * 0.0001 + i;
            t = this.simplex.noise2D(i, t);
            t = (t + 1) * 0.5;
            this.levels[i].value = t;
        }
    }

    detectPeak() {
        for (let i = 0; i < this.levels.length; i++) {
            const level = this.levels[i];

            // ignore if last peak happened before the min interval
            if (level.peakElapsed < this.peakInterval) {
                level.peakElapsed++;
                continue;
            }

            // new peak
            if (level.value > level.peakLast && level.value > this.peakCutOff) {
                level.peakLast = level.value * 1.2;
                level.peakElapsed = 0;
                this.emit(AppAudio.AUDIO_PEAK, { index: level.index, value: level.value });
            } else {
                level.peakLast *= this.peakDecay;
            }
        }
    }

    getLevel(index) {
        return this.levels[index];
    }

    getValue(index) {
        return this.levels[index].value || 0;
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onSourceEnded() {
        // reset data
        for (let i = 0; i < this.levels.length; i++) {
            this.levels[i].value = 0;
        }
    }
}

