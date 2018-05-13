/* eslint-disable no-console */
import AsyncPreloader from 'async-preloader';
import { addFileDropListener } from './utils/file.utils';

import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

const debug = {
    visId: 'Viz06',
    assets: [
        { 'id': 'track', 'src': 'audio/INDIGO-PALACE-FIVERS.mp3', 'body': 'arrayBuffer' },
        { 'id': 'Texture_06', 'src': 'images/Texture_06.jpg' }
    ]
};

class App {

    constructor() {
        this.loadCoreAssets();
    }

    // API

    pause () {
        console.log('pause');
    }

    play () {
        console.log('play');
    }

    changeVis ({assets, viewId}) {
        this.initLoader(assets, viewId);
    }

    mute () {
        console.log('mute');
    }

    onMusicLoaded (data) {
        window.dispatchEvent(new CustomEvent('onMusicLoaded', {detail: data}));
    }

    onMusicEnd (data) {
        window.dispatchEvent(new CustomEvent('onMusicEnd', {detail: data}));
    }

    //

    loadCoreAssets() {
        AsyncPreloader.loadManifest('data/manifest.json')
            .then(() => {
                this.initFileReader();
                if(window.parent && window.parent.onVisReady) {
                    window.parent.onVisReady();
                } else {
                    this.initLoader(debug.assets, debug.visId);
                }
            })
            .catch(err => {
                console.log('AsyncPreloader error', err);
            });
    }

    initLoader(files, vizId) {
        AsyncPreloader.loadItems(files)
            .then(() => {
                this.initAudio();
                this.initView(vizId);

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

    initView(vizId) {
        AppView.init(vizId);
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
