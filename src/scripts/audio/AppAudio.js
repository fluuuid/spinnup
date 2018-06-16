import EventEmitter from 'events';

import WebAudio from './WebAudio';
import DOMAudio from './DOMAudio';
import AudioLevel from './AudioLevel';

class AppAudio extends EventEmitter {

    get FFT_SIZE() { return 1024; }
    get DISTRIBUTION_LINEAR() { return 0; }
    get DISTRIBUTION_EXPONENTIAL() { return 1; }

    get paused() { return this.audio.paused; }
    get currentTime() { return this.audio.currentTime; }
    get context() { return this.audio.context || {}; }
    get analyserNode() { return this.audio.analyserNode || {}; }
    get peakDecay() { return this.audio.peakDecay; }
    get peakInterval() { return this.audio.peakInterval; }
    get peakCutOff() { return this.audio.peakCutOff; }
    get levelsDistribution() { return this.audio.levelsDistribution; }
    get levelsCount() { return this.audio.levelsCount; }

    set peakDecay(value) { this.audio.peakDecay = value; }
    set peakInterval(value) { this.audio.peakInterval = value; }
    set peakCutOff(value) { this.audio.peakCutOff = value; }
    set levelsDistribution(value) { this.audio.levelsDistribution = value; }

    get AUDIO_PEAK() 	{ return 'audio:peak'; }
    get AUDIO_LOAD() 	{ return 'audio:load'; }
    get AUDIO_DECODE() 	{ return 'audio:decode'; }
    get AUDIO_PLAY() 	{ return 'audio:play'; }
    get AUDIO_PAUSE() 	{ return 'audio:pause'; }
    get AUDIO_END() 		{ return 'audio:end'; }
    get AUDIO_RESTART() 	{ return 'audio:restart'; }

    constructor() {
        super();

        // web audio or dom <audio>
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audio = (AudioContext) ? new WebAudio() : new DOMAudio();

        this.audio.on(this.AUDIO_PLAY, this.onAudioPlay.bind(this));
        this.audio.on(this.AUDIO_PAUSE, this.onAudioPause.bind(this));
        this.audio.on(this.AUDIO_PEAK, this.onAudioPeak.bind(this));
    }

    onAudioPlay(e) {
        this.emit(this.AUDIO_PLAY, e);
    }

    onAudioPause(e) {
        this.emit(this.AUDIO_PAUSE, e);
    }

    onAudioPeak(e) {
        this.emit(this.AUDIO_PEAK, e);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    decode(arrayBuffer, src, cb) {
        return this.audio.decode(arrayBuffer, src, cb);
    }

    play() {
        return this.audio.play();
    }

    pause() {
        return this.audio.pause();
    }

    stop() {
        return this.audio.stop();
    }

    seek(time) {
        return this.audio.seek(time);
    }

    mute() {
        return this.audio.mute();
    }

    unmute() {
        return this.audio.unmute();
    }

    update() {
        return this.audio.update();
    }

    getLevel(index) {
        return this.audio.getLevel(index);
    }

    getValue(index) {
        return this.audio.getValue(index);
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onFileDrop(file, arrayBuffer) {
        this.decode(arrayBuffer, () => {
            this.fileName = file.name;
            this.play();
        });
    }
}

export default new AppAudio();
