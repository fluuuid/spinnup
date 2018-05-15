import { Viz06 } from './Viz06';

export class Viz04 extends Viz06 {

    constructor(id) {
        // use parent's id
        super('Viz06');
        this.id = id;

        this.equaliserMode = 1;
    }

    initBackground() {
        super.initBackground();

        this.bg.material.uniforms.uModD.value.set(-1.1, 0.85);
    }

    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

    onAudioPeak(e) {
        super.onAudioPeak(e);

        this.bg.material.uniforms.uModB.value = 0.1;
    }
}
