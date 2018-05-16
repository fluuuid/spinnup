// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uData;
uniform float uDataLength;
uniform float uTime;
uniform float uIntensity;
uniform float uModA;
uniform vec2 uAspect;

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

    vec2 v = (uv - 0.5) * uAspect + vec2(0.02, 0.0);
    vec2 a = vec2(length(v), atan(v.y, v.x));
   
    const float pi = 3.1416;
    const float k = 30.0;
    const float w = 10.0;
    const float t = 10.0;
    
    float i = floor(a.x * k);
    
    float d = mod(uTime * 30.0 - i * 2.0, uDataLength) / uDataLength;
    vec2 uvd = vec2(d, 0.0);
    float b = texture2D(uData, uvd).r * uIntensity;

    a = vec2((b * 0.4) * (1.0 / k), (floor(a.y * (1.0 / pi) * (i * w + t)) + 0.5) * pi / (i * w + t));
    a = vec2(cos(a.y), sin(a.y)) * a.x;
    
    color = texture2D(uTexture, uv + a);
    // color = texture2D(uData, uvd);
    
    gl_FragColor = color;
}
