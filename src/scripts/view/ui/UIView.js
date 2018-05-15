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
        this.vizLogoEqualiser = 0.5;
        this.vizLogoWireframe = false;
        
        this.vizLogoStepsX = 2.0;
        this.vizLogoStepsY = 2.0;
        this.vizLogoOffsetX = 0.002;
        this.vizLogoOffsetY = 0.1;
        this.vizLogoGapSize = 0.5;
        this.vizLogoOverride = false;

        this.vizLogoStrength = 0;

        this.range = [0, 1];
        this.rangeDisplace = [0, 0.04];
        this.rangeSteps = [1, 40];
        this.rangeOffset = [-0.05, 0.05];
        this.rangeGap = [0, 10];
        this.rangeDecay = [0.9, 1.0];
        this.rangeInterval = [0, 60];
        this.rangeDetect = [-1, this.audio.levelsCount - 1];

        this.initControlKit();
        // this.initStats();
        this.initAudioBars();

        this.onAudioDistributionChange(this.audioDistribution);

        this.controlKit.disable();
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
        
        /*
        .addGroup({ label: 'Viz 06', enable: true })
        .addSelect(this, 'vizBgOptions', { label: 'bg mix', selected: this.vizBg, onChange: (index) => { that.onVizBgChange(index); } })
        .addSelect(this, 'vizLogoOptions', { label: 'logo fx', selected: this.vizLogo, onChange: (index) => { that.onVizLogoChange(index); } })
        .addSlider(this, 'vizLogoDisplace', 'rangeDisplace', { label: 'logo fx intensity' })
        .addSlider(this, 'vizLogoEqualiser', 'range', { label: 'logo equaliser' })
        .addCheckbox(this, 'vizLogoWireframe', { label: 'logo wireframe', onChange: () => { that.onVizChange(); } })

        .addGroup({ label: 'Viz 10', enable: true })
        .addCheckbox(this, 'vizLogoOverride', { label: 'logo override' })
        .addSlider(this, 'vizLogoStepsX', 'rangeSteps', { label: 'logo steps x', step: 1, dp: 0, onChange: () => { that.onViz10Change(); } })
        .addSlider(this, 'vizLogoStepsY', 'rangeSteps', { label: 'logo steps y', step: 1, dp: 0, onChange: () => { that.onViz10Change(); } })
        .addSlider(this, 'vizLogoOffsetX', 'rangeOffset', { label: 'logo offset x', dp: 3, onChange: () => { that.onViz10Change(); } })
        .addSlider(this, 'vizLogoOffsetY', 'rangeOffset', { label: 'logo offset y', dp: 3, onChange: () => { that.onViz10Change(); } })
        .addSlider(this, 'vizLogoGapSize', 'rangeGap', { label: 'logo gap', onChange: () => { that.onViz10Change(); } })
        .addCheckbox(this, 'vizLogoWireframe', { label: 'logo wireframe', onChange: () => { that.onViz10Change(); } })
        */

        .addGroup({ label: 'Viz 13', enable: true })
        .addSlider(this, 'vizLogoStrength', 'range', { label: 'logo strength', onChange: () => { that.onViz13Change(); } })
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

    onViz10Change() {
        this.view.webgl.viz.logo.material.uniforms.uWireframe.value = (this.vizLogoWireframe) ? 1 : 0;
        this.view.webgl.viz.logo.material.wireframe = this.vizLogoWireframe;

        this.view.webgl.viz.logo.material.uniforms.uSteps.value.x = this.vizLogoStepsX;
        this.view.webgl.viz.logo.material.uniforms.uSteps.value.y = this.vizLogoStepsY;
        this.view.webgl.viz.logo.material.uniforms.uOffset.value.x = this.vizLogoOffsetX;
        this.view.webgl.viz.logo.material.uniforms.uOffset.value.y = this.vizLogoOffsetY;
        this.view.webgl.viz.logo.material.uniforms.uGapSize.value = this.vizLogoGapSize;
    }

    onViz13Change() {
        this.view.webgl.viz.logo.material.uniforms.uStrength.value = this.vizLogoStrength;
    }

    onVizBgChange(index) {
        this.vizBg = index || 0;
        this.view.webgl.viz.bg.material.uniforms.uDebug.value = this.vizBg;
    }

    onVizLogoChange(index) {
        this.vizLogo = index || 0;
    }
}
