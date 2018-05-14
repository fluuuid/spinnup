// Created by @brunoimbrizi / brunoimbrizi.com
// Based on http://glslb.in/s/c1a93844

vec3 sample(vec2 uv);

#define ITERATIONS 10
#pragma glslify: blur = require('glsl-hash-blur', sample=sample, iterations=ITERATIONS)

#pragma glslify: ease = require(glsl-easings/sine-in-out)
#pragma glslify: when_eq = require(glsl-conditionals/when_eq)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uData;
uniform float uDataLength;
uniform float uTime;
uniform float uWireframe;

vec3 sample(vec2 uv) {
	return texture2D(uTexture, uv).rgb;
}

float map(float x, float min, float max) {
	return min + (max - min) * x;
}

float getStrength(float t) {
	float steps = uDataLength;
	float step = 1.0 / steps;
	float i = floor(t * steps);		// [0...steps]

	float p = t - step * i;			// convert t to [0...step]
	float q = p * steps;			// map [0...step] to [0...1]
	q = ease(q);					// smooth step

	// sample prev and next strength values
	float a = texture2D(uData, vec2(step * (i + 0.0), 0.5)).r;
	float b = texture2D(uData, vec2(step * (i + 1.0), 0.5)).r;

	float r = map(q, a, b);			// map [0...1] to [a...b]

	// r = texture2D(uData, vec2(t, 0.5)).r;
	return r;
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	// logo
	vec4 tex = texture2D(uTexture, uv);
	vec4 colA = vec4(vec3(1.0), tex.g);

  	float aspect = 1.0;

  	float strength = getStrength(uv.x);
  	float radius = 0.5 * strength;

  	float tick = floor(fract(uTime) * 30.0);
  	float jitter = mod(tick * 382.0231, 21.321);

  	vec2 uvt = uv * vec2(aspect, 1.0);
  	vec3 texb = blur(uvt, radius, aspect / 4.0, jitter);
  	vec4 colB = vec4(vec3(1.0), texb.g);

	color += colB * when_eq(uWireframe, 0.0);
	color += vec4(1.0) * when_eq(uWireframe, 1.0);

	// color = vec4(0.0, 0.0, 0.0, 1.0);
	// color = texture2D(uData, uv);
	// color.r = easeStrength(uv.x);

	gl_FragColor = color;
	
}
