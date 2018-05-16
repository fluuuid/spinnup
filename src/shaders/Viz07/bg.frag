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

float f(float a, float b) {
    vec2 uv = vUv - 0.5;
    uv.y *= 0.7;
    return sin(10.3 * length(uv * 20.0 + vec2(cos(a), sin(b))));
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

    vec2 v = (uv - 0.5) * uAspect + vec2(0.02, 0.0);
    vec2 a = vec2(length(v), atan(v.y, v.x));
   
    float pi = 3.1416;
    float k = 30.0;
    float w = 10.0;
    float t = 10.0;
    
    float i = floor(a.x * k);
    
    float d = mod(uTime * 30.0 - i * 2.0, uDataLength) / uDataLength;
    vec2 uvd = vec2(d, 0.0);
    float b = texture2D(uData, uvd).r * 4.0;

    a = vec2((b * 0.4) * (1.0 / k), (floor(a.y * (1.0 / pi) * (i * w + t)) + 0.5) * pi / (i * w + t));
    a = vec2(cos(a.y), sin(a.y)) * a.x;

    // color -= f(time, time) * f(f(time * 0.2, uv.x), uv.y);
    float c = f(uTime, uTime) * f(f(uTime * 0.2, uv.x), uv.y);
    // c += sin(0.1 * length((uv + vec2(-0.5)) * uTime));

    color = texture2D(uTexture, uv * 0.9 + 0.05 + a + c * 0.01 * (uIntensity + 0.1));
    // color = texture2D(uData, uvd);

    color.rgb *= vec3(1.0 - c * uIntensity);
    // color.rgb = vec3(c);

    gl_FragColor = color;
}
