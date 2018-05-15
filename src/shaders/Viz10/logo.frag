// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: when_eq = require(glsl-conditionals/when_eq)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vScale;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uOffset;
uniform vec2 uSteps;
uniform float uGapSize;
uniform float uWireframe;

float crop(float x, float min, float max) {
	return 1.0 * step(min, x) * (1.0 - step(max, x));
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);
	vec2 offset = vec2(0.0);

	float gap = uOffset.x;
	float steps = uSteps.x;
	float step = 1.0 / steps;
	float i = floor(uv.x * steps);		// [0...steps]

	// scale
	// vec2 uvs = uv * vScale - (vScale - 1.0) / 2.0;
	vec2 uvs = uv * vScale;

	// offset y
	// alternate between -1, 1
	float a = uSteps.y;
	// float alt = mod(i, a) * a - a / 2.0;
	float alt = mod(i, a) * 2.0 - 1.0;
	float amt = uOffset.y;
	offset.y = alt * amt;

	// offset x
	offset.x = -gap * i;
	
	vec2 uvo = uvs + offset;

	// logo
	vec4 tex = texture2D(uTexture, uvo);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);


	// hide gaps
	float sstep = vScale.x / steps;
	float j = floor((uv.x + gap) * steps);

	float cropped = crop(uvs.x, sstep * j - gap * uGapSize, sstep * j + gap * uGapSize);

	// ignore edges
	colB.a -= cropped * when_gt(j, 0.0) * when_lt(j, steps);

	color += colB * when_eq(uWireframe, 0.0);
	color += vec4(1.0) * when_eq(uWireframe, 1.0);

	gl_FragColor = color;
	
}
