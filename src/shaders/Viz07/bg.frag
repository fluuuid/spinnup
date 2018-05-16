// Created by @brunoimbrizi / brunoimbrizi.com
// Based on https://www.shadertoy.com/view/4ttGW4 by glk7
// and on https://www.shadertoy.com/view/4slXWn by FabriceNeyret2

#define PI 3.141592

#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uData;
uniform float uDataLength;
uniform float uTime;
uniform float uIntensity;
uniform vec2 uAspect;

float f(float a, float b) {
    vec2 uv = vUv - 0.5;
    uv.y *= 0.7;
    return sin(10.3 * length(uv * 20.0 + vec2(cos(a), sin(b))));
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

    // rings
    float k = 30.0;
    float w = 10.0;
    float t = 10.0;

    vec2 v = (uv - 0.5) * uAspect + vec2(0.02, 0.0);
    vec2 a = vec2(length(v), atan(v.y, v.x));
   
    float i = floor(a.x * k);
    float iwt = (i * w + t);
    
    // audio data from texture
    float d = mod(uTime * 30.0 - i * 2.0, uDataLength) / uDataLength;
    vec2 uvd = vec2(d, 0.0);

    float b = texture2D(uData, uvd).r * 4.0;

    a = vec2((b * 0.4) * (1.0 / k), (floor(a.y * (1.0 / PI) * iwt) + 0.5) * PI / iwt);
    a = vec2(cos(a.y), sin(a.y)) * a.x;

    float c = f(uTime, uTime) * f(f(uTime * 0.2, uv.x), uv.y);

    color = texture2D(uTexture, uv * 0.9 + 0.05 + a + c * 0.01 * (uIntensity + 0.1));

    // displacement
    color.rgb *= vec3(1.0 - c * uIntensity);

    // draw data texture
    // color = texture2D(uData, uvd);

    // draw displacement
    // color.rgb = vec3(c);

    gl_FragColor = color;
}
