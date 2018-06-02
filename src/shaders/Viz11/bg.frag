// Created by @brunoimbrizi / brunoimbrizi.com
// https://www.shadertoy.com/view/Md2GDw by kusma

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)
#pragma glslify: when_eq = require(glsl-conditionals/when_eq)
#pragma glslify: mirrored = require(glsl-y-repeat/mirrored)

varying vec2 vUv;

uniform float uTime;
uniform float uAlpha;
uniform float uSaturation;
uniform float uTimeRoll;
uniform float uModA;
uniform float uModB;
uniform sampler2D uTexture;
uniform sampler2D uData;
uniform float uDataLength;

// IQ's noise value 2D
float hash(vec2 p) {
    float h = dot(p + uTime * 0.0001,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
        
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float wave(vec2 p) {
    return sin(p.x * 0.5) * cos(p.y);
}

float fbm4(vec2 p) {
    float f = 0.0;
    f += 0.5000 * wave(p); p = m * p * 2.02;
    f += 0.2500 * wave(p); p = m * p * 2.03;
    f += 0.1250 * wave(p); p = m * p * 2.01;
    f += 0.0625 * wave(p);
    return f * 0.9375;
}
  
void main(void){
    vec2 uv = vUv;
    vec4 color = vec4(0.0);

    // split the screen in horizontal bands
    float steps = 18.0;
    float size = 1.0 / steps;
    float i = floor(uv.y / size) * 0.1;

    // modulator
    float w = clamp(mod(noise(uTime + floor(uv.y / steps)), 1.0), 0.0, 1.0) * 2.0 - 1.0;

    // wave type 2
    vec2 uve = vec2(0.8, 0.0) * fbm4(floor(uv / 6.0) + w + i + uTime);
    vec2 uvf = vec2(0.2, 0.0) * fbm4(floor(uv / steps) + i + uTime * 0.2);

    // offset uv
    vec2 uvn = mirrored(uv + uvf);
    // vec2 uvn = mirrored(uv + uve);
    
    // color += texture2D(uTexture, uvn);

    float y = floor(uv.y * uDataLength) / uDataLength;
    float a = texture2D(uData, vec2(y, 0.5)).r;
    vec2 uva = vec2(-1.0, 0.0) * a;
    uva.x -= uTimeRoll * 0.05;
    uva.y -= uModB;
    // vec2 uva = vec2(0.0, 1.0) * a;
    // uva.y += uTimeRoll * 0.05;
    // uva.y += uModB;

    vec2 uvm = mirrored(uv + uva);
    color += texture2D(uTexture, uvm);

    color.r *= texture2D(uTexture, uvn).r;
    color.rgb *= texture2D(uTexture, uvn).rbb;

    float block_thresh = pow(fract(uTime * 12.0453), 2.0) * 0.2;
    color.rgb += (-color.rgb + color.rrr) * when_lt(snoise2(vec2(uModA, rand(uv.y))), block_thresh);

    // color.gb *= 0.0; // just red, it looks great

    color.rgb = mix(vec3(0.2), color.rgb, uAlpha);
    color.rgb = mix(color.rrr, color.rgb, uSaturation);

    gl_FragColor = color;
}
