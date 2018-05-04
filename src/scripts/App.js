import AsyncPreloader from 'async-preloader';

import { addFileDropListener } from './utils/file.utils';

import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

class App {

    constructor() {
        this.initLoader();
    }

    // API

    pause () {
        console.log('pause');
    }

    play () {
        console.log('play');
    }

    changeMusic () {
        console.log('changeMusic');
    }

    mute () {
        console.log('mute');
    }

    changeStyle () {
        console.log('changeStyle');
    }

    onMusicLoaded (data) {
        window.dispatchEvent(new CustomEvent('onMusicLoaded', {detail: data}));
    }

    onMusicEnd (data) {
        window.dispatchEvent(new CustomEvent('onMusicEnd', {detail: data}));
    }

    onFilesLoaded(data) {
        window.dispatchEvent(new CustomEvent('onFilesLoaded', {detail: data}));
    }

    //

    initLoader() {
        AsyncPreloader.loadManifest('data/manifest.json')
            .then(items => {
                this.initAudio();
                this.initFileReader();

                this.onFilesLoaded({test: 'asdasdas'});

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
        });
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
