# SPINNUP

Audio visualisations in WebGL for SPINNUP [https://spinnup.com/gb/](https://spinnup.com/gb/)

Install
-----

```shell
git clone https://github.com/fluuuid/spinnup.git
npm install
```

Run
-----

```shell
npm run start
```
Open a web browser and go to [http://localhost:3000/](http://localhost:3000/)

API
----

**isPaused()** - Returns Boolean.

**pause()** - Pauses the audio track.

**play()** - Starts playing the audio track.

**changeViz({ trackSrc, vizId })** - Changes the visualisation and the audio track.
`trackSrc` - String. Path to the audio file.
`vizId` - String. Name of the visualisation. (i.e. 'Viz02' or 'Viz10')


Develop
-----

The project was built using [Three.js](https://threejs.org/), a custom audio lib and custom shaders.
Each visualisation consists of two quads, one for the background and one for the logo - with the exception of Viz07 which uses a GLFT object for the logo.
They can be found inside `/view/webgl/viz/Viz[Number]` and their corresponding shaders can be found inside `/shaders/Viz[Number]`.

*Steps to create a new visualisation `VizXX`*
- Create `VizXX.js` extending `AbstractViz` inside `/view/webgl/viz/VizXX`
- Create `bg.frag` and `logo.frag` inside `/shaders/VizXX`
- Define assets to be loaded for VizXX in `/data/AppData`
- Append `<option value="VizXX">Visualisation XX</option>` to `index.html`
- For quick access during development, append the new viz to the fallback of `loadCoreAssets()` in `App.js` 
