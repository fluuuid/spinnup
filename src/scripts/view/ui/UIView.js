import ControlKit from '@brunoimbrizi/controlkit';
import Stats from 'stats.js';

import AppAudio from '../../audio/AppAudio';
import AppView from '../../view/AppView';
import UIAudioBars from './UIAudioBars';

export default class UIView {

    constructor() {
        this.view = AppView;
        this.audio = AppAudio;

        this.audioSmoothing = this.audio.analyserNode.smoothingTimeConstant;
        this.audioPeakDecay = this.audio.peakDecay;
        this.audioPeakInterval = this.audio.peakInterval;
        this.audioPeakCutOff = this.audio.peakCutOff;
        this.audioDistributionOptions = ['linear', 'exponential'];
        this.audioDistribution = 1;

        this.vizBgOptions = ['all', 'only A', 'only B', 'none'];
        this.vizBg = 0;
        this.vizLogoOptions = ['auto', 'A', 'B', 'C'];
        this.vizLogo = 0;
        this.vizLogoDisplace = 0;
        this.vizLogoEqualiser = true;
        this.vizLogoWireframe = false;

        this.range = [0, 1];
        this.rangeDisplace = [0, 0.04];
        this.rangeDecay = [0.9, 1.0];
        this.rangeInterval = [0, 60];
        this.rangeDetect = [-1, this.audio.levelsCount - 1];

        this.initControlKit();
        // this.initStats();
        this.initAudioBars();

        this.onAudioDistributionChange(this.audioDistribution);
    }

    initControlKit() {
        const that = this;

        this.controlKit = new ControlKit();
        this.controlKit.addPanel({ width: 300, enable: true })

        .addGroup({ label: 'Audio', enable: true })
        .addSelect(this, 'audioDistributionOptions', { label: 'distribution', selected: this.audioDistribution, onChange: (index) => { that.onAudioDistributionChange(index); } })
        .addCanvas({ label: 'bars', height: 100 })
        .addSlider(this, 'audioSmoothing', 'range', { label: 'smoothing', onChange: () => { that.onAudioChange(); } })
        .addSlider(this, 'audioPeakDecay', 'rangeDecay', { label: 'peak decay', dp: 3, onChange: () => { that.onAudioChange(); } })
        .addSlider(this, 'audioPeakInterval', 'rangeInterval', { label: 'peak interval', onChange: () => { that.onAudioChange(); } })
        .addSlider(this, 'audioPeakCutOff', 'range', { label: 'peak cutoff', onChange: () => { that.onAudioChange(); } })
        
        .addGroup({ label: 'Viz', enable: true })
        .addSelect(this, 'vizBgOptions', { label: 'bg mix', selected: this.vizBg, onChange: (index) => { that.onVizBgChange(index); } })
        .addSelect(this, 'vizLogoOptions', { label: 'logo fx', selected: this.vizLogo, onChange: (index) => { that.onVizLogoChange(index); } })
        .addSlider(this, 'vizLogoDisplace', 'rangeDisplace', { label: 'logo fx intensity' })
        .addCheckbox(this, 'vizLogoEqualiser', { label: 'logo equaliser' })
        .addCheckbox(this, 'vizLogoWireframe', { label: 'logo wireframe', onChange: () => { that.onVizChange(); } })
        // .addSlider(this, 'vizModD', 'rangeKnobA', { label: 'logo D', onChange: () => { that.onVizChange(); } })
        // .addSlider(this, 'vizModE', 'rangeKnobA', { label: 'logo E', onChange: () => { that.onVizChange(); } })

    }

    initStats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    initAudioBars() {
        // hack to get canvas component
        const canvasComponent = this.controlKit._panels[0]._groups[0]._components[1];
        const canvas = canvasComponent.getCanvas();

        this.audioBars = new UIAudioBars(canvas, this.audio);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    draw() {
        if (!this.controlKit._enabled) return;
        this.audioBars.draw();
    }

    toggle() {
        if (this.controlKit._enabled) this.controlKit.disable();
        else this.controlKit.enable();
    }

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioChange() {
        this.audio.analyserNode.smoothingTimeConstant = this.audioSmoothing;
        this.audio.peakDecay = this.audioPeakDecay;
        this.audio.peakInterval = this.audioPeakInterval;
        this.audio.peakCutOff = this.audioPeakCutOff;
    }
	
    onAudioDistributionChange(index) {
        this.audioDistribution = index || 0;
        this.audio.levelsDistribution = index || 0;
    }

    onVizChange() {
        // let uniforms = this.view.webgl.viz.bg.material.uniforms;
        // uniforms.uKnobA.value = this.vizModA;
        // uniforms.uKnobB.value = this.vizModB;
        // uniforms.uKnobC.value = this.vizModC;

        // uniforms = this.view.webgl.viz.logo.material.uniforms;
        // uniforms.uKnobD.value = this.vizModD * 0.01;
        // uniforms.uKnobE.value = this.vizModE;

        this.view.webgl.viz.logo.material.uniforms.uWireframe.value = (this.vizLogoWireframe) ? 1 : 0;
        this.view.webgl.viz.logo.material.wireframe = this.vizLogoWireframe;
    }

    onVizBgChange(index) {
        this.vizBg = index || 0;
        this.view.webgl.viz.bg.material.uniforms.uDebug.value = this.vizBg;
    }

    onVizLogoChange(index) {
        this.vizLogo = index || 0;
    }
}
