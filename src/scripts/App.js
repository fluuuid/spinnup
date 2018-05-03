import AsyncPreloader from 'async-preloader';

import { addFileDropListener } from './utils/file.utils';

import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

class App {

	constructor() {
		this.initLoader();
	}

	initLoader() {
		AsyncPreloader.loadManifest('data/manifest.json')
		.then(items => {
			this.initAudio();
			this.initFileReader();

			// DEBUG
			this.audio = AppAudio;
			this.view = AppView;
		})
		.catch(err => {
			console.log('AsyncPreloader error', err);
		});
	}

	initAudio() {
		// play loaded track
		AppAudio.decode(AsyncPreloader.items.get('track'), () => {
			AppAudio.play();
		})
	}

	initFileReader() {
		const el = document.getElementById('container');
		addFileDropListener(el, this.onFileDrop.bind(this));
	}

	onFileDrop(file, result) {
		console.log('App.onFileDrop', file, result);
		AppAudio.onFileDrop(file, result);
	}
}

export default new App();
