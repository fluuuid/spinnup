const supportsWebAudio = () => {
	const AudioContext = window.AudioContext || window.webkitAudioContext;
    return AudioContext !== undefined;
};

export { supportsWebAudio };
