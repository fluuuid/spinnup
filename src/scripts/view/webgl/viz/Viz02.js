import { Viz13 } from './Viz13';

export class Viz02 extends Viz13 {

    constructor(id) {
        // use parent's id
        super('Viz13');
        this.id = id;

        // override data levels
        this.dataLevels = [12, 8, 16, 2, 22, 6, 14, 10];
    }

    initBackground() {
        super.initBackground();

        const uniforms = this.bg.material.uniforms;
        uniforms.uModA.value.set(0.0, -0.15);
    }


    // ---------------------------------------------------------------------------------------------
    // PUBLIC
    // ---------------------------------------------------------------------------------------------

    // ---------------------------------------------------------------------------------------------
    // EVENT HANDLERS
    // ---------------------------------------------------------------------------------------------

}
