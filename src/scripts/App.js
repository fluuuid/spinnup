/* eslint-disable no-console */
import AsyncPreloader from 'async-preloader';

import { addFileDropListener } from './utils/file.utils';
import { assetsList } from './data/AppData';

import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

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

    changeViz ({trackSrc, vizId}) {
        const track = { id: 'track', src: trackSrc, body: 'arrayBuffer' };
        const assets = assetsList[vizId];
        assets.push(track);

        this.initLoader(assets, vizId);
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
                if(window.parent && window.parent.onVizReady) {
                    window.parent.onVizReady();
                } else {
                    // DEBUG
                    // this.changeViz({ trackSrc: 'audio/MADANII-WVTCHMEN.mp3', vizId: 'Viz02'})
                    this.changeViz({ trackSrc: 'audio/INDIGO-PALACE-FIVERS.mp3', vizId: 'Viz04'})
                    // this.changeViz({ trackSrc: 'audio/INDIGO-PALACE-FIVERS.mp3', vizId: 'Viz06'})
                    // this.changeViz({ trackSrc: 'audio/Maes-MaesEstLiberable-PART-II.mp3', vizId: 'Viz10'})
                    // this.changeViz({ trackSrc: 'audio/Ben-Esser-Love-You-More.mp3', vizId: 'Viz13'})
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
