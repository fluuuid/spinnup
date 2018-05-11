const ready = require('domready');

console.log(`%c${process.env.VERSION}`, 'padding: 5px 10px; background-color: black; font-weight: bold; color: white;'); //eslint-disable-line

import App from './App';

ready(() => {
    window.app = App;
    if(window.parent && window.parent.visLoaded) window.parent.visLoaded();
});
