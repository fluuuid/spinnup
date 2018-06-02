// Created by @brunoimbrizi / brunoimbrizi.com
// Based on https://www.shadertoy.com/view/XtBGDK by sophje

#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)
#pragma glslify: when_eq = require(glsl-conditionals/when_eq)

varying vec2 vUv;

uniform float uTime;
uniform float uAlpha;
uniform float uSaturation;
uniform float uModA;
uniform float uModB;
uniform float uBoost;
uniform sampler2D uTexture;


const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
  	float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
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

vec2 mirror(vec2 v) {
	v += -v * 2.0 * when_lt(v, vec2(0.0));
	v += (2.0 - v * 2.0) * when_gt(v, vec2(1.0));
	return v;
}

vec4 downsample(sampler2D sampler, vec2 uv, float size) {
    return texture2D(sampler, vec2(uv.x, uv.y - step(uv.y, size)));
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	// split the screen in vertical bands
	float steps = 40.0;
	float size = 1.0 / steps;
	float i = floor(uv.x / size) * 0.1;

	// modulator
	float w = clamp(mod(noise(uTime + uv.y), 1.0), 0.0, 1.0) * 2.0 - 1.0;

	vec2 c = vec2(uv.x - 2.5, uv.y - 1.5);
	vec2 n = vec2(log(sqrt(c.x * c.x + c.y * c.y)), atan(c.x, c.y));

	float d = 0.0;
	d += cos(10.0 * c.y + uTime);
	d += cos(2.0 * c.x - uTime);
	d += cos(5.0 * n.y - uTime);
	d += cos(6.0 * n.x - uTime);
	// d += cos(2500.0 * n.y + uTime) * when_eq(uModB, 1.0); // glitchy blur

	// wave type 1
	vec2 uvd = vec2(uv.x * 0.9 - d * 0.01 + 0.05, uv.y + sin(d * 2.0 + uTime) * 0.1);

	// wave type 2
	vec2 uvf = vec2(0.8, -0.25) * fbm4(1.2 * uv + i + uTime * 0.3);

	// offset uv
	vec2 offset = vec2(uvf.x * w * uBoost, uvf.y);
	vec2 uvm = mirror(uv + offset);
	
	color += texture2D(uTexture, uvm) * when_eq(uModA, 0.0);
	color += texture2D(uTexture, mirror(uvd)) * when_eq(uModA, 1.0);

	// downsampled
	// Based on https://www.shadertoy.com/view/4dtGzl
	float sampleSize = 0.01 * w;
    float dx = sampleSize;
    vec4 colA = mix(downsample(uTexture, uvm * 0.9 - vec2(dx, 0.0), sampleSize), downsample(uTexture, uvm * 0.9 + vec2(dx, 0.0), sampleSize), mod(uvm.x, dx) / dx);
    color += (-color + colA) * when_eq(uModB, 1.0);

    color.rgb = mix(vec3(0.4), color.rgb, uAlpha);
    color.rgb = mix(color.rrr, color.rgb, uSaturation);

    gl_FragColor = color;
}
