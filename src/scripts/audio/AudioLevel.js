export default class AudioLevel {

	constructor(index) {
		this.index = index;
		this.value = 0;

		this.peakElapsed = 0;
		this.peakLast = 0;
	}

}