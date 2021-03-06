/* eslint-disable no-console */
import AsyncPreloader from 'async-preloader';

import { addFileDropListener } from './utils/file.utils';
import { assetsList } from './data/AppData';

import AppAudio from './audio/AppAudio';
import AppView from './view/AppView';

class App {

    constructor() {
        this.loadCoreAssets();

        // DEBUG
        this.audio = AppAudio;
        this.view = AppView;
    }

    // API

    get isPaused() {
        return this.audio.paused;
    }

    pause () {
        if(this.isPaused) return;
        this.audio.pause();
    }

    play () {
        if(!this.isPaused) return;
        this.audio.play();
    }

    changeViz ({trackSrc, vizId}) {
        const track = { id: 'track', src: trackSrc, body: 'arrayBuffer' };
        const assets = assetsList[vizId];

        // load assets first
        AsyncPreloader.loadItems(assets).then(() => {
            this.initView(vizId);
            // then load audio track 
            AsyncPreloader.loadItems([track]).then(() => {
                this.initAudio();
                AppView.webgl.viz.show();
            });
        })
        .catch(err => {
            console.log('AsyncPreloader error', err);
        });

        // stop previous viz
        AppAudio.stop();
        if (AppView.webgl.viz) AppView.webgl.viz.hide();
    }

    //

    loadCoreAssets() {
        AsyncPreloader.loadManifest('data/manifest.json')
            .then(() => {
                // this.initFileReader();
                if(window.parent && window.parent.onVizReady) {
                    window.parent.onVizReady();
                } else {
                    // DEBUG
                    // this.changeViz({ trackSrc: 'audio/INDIGO-PALACE-FIVERS.mp3', vizId: 'Viz06'})
                    // this.changeViz({ trackSrc: 'audio/Maes-MaesEstLiberable-PART-II.mp3', vizId: 'Viz10'})
                    // this.changeViz({ trackSrc: 'audio/Ben-Esser-Love-You-More.mp3', vizId: 'Viz13'})
                    // this.changeViz({ trackSrc: 'audio/MADANII-WVTCHMEN.mp3', vizId: 'Viz02'})
                    // this.changeViz({ trackSrc: 'audio/Chuchoter-Pieces.mp3', vizId: 'Viz07'})
                    this.changeViz({ trackSrc: 'audio/Kiiara-Gold-feat-Lil-Wayne-Remix.mp3', vizId: 'Viz11'})
                }
            })
            .catch(err => {
                console.log('AsyncPreloader error', err);
            });
    }

    initAudio() {
        // play loaded track
        AppAudio.decode(AsyncPreloader.items.get('track'), () => {
            // AppAudio.play();

            if(window.parent && window.parent.onVizReady) {
                window.parent.onFilesLoaded();
            }
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
