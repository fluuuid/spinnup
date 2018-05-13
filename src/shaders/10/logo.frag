// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: when_eq = require(glsl-conditionals/when_eq)

varying float vSteps;
varying float vGap;
varying vec2 vScale;
varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uWireframe;

float crop(float x, float min, float max) {
	return 1.0 * step(min, x) * (1.0 - step(max, x));
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);
	vec2 offset = vec2(0.0);

	float steps = vSteps;
	float step = 1.0 / (steps - 0.0);
	float i = floor(uv.x * steps);		// [0...steps]

	// scale
	// vec2 uvs = uv * vScale - (vScale - 1.0) / 2.0;
	vec2 uvs = uv * vScale;

	// offset y
	// alternate between -1, 1
	float alt = mod(i, 2.0) * 2.0 - 1.0;
	float amt = 0.1;
	offset.y = alt * amt;

	// offset x
	float gap = vGap;
	offset.x = -vGap * i;
	
	vec2 uvo = uvs + offset;

	// logo
	vec4 tex = texture2D(uTexture, uvo);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);


	// if (uv.x > 0.5 / vScale.x && uv.x < 0.5 / vScale.x + vGap / vScale.x) colB.a = 0.0;
	// if (uvs.x > 0.5 && uvs.x < 0.5 + vGap) colB.a = 0.0;
	// colB.a -= crop(uv.x, 0.5 / vScale.x, 0.5 / vScale.x + vGap / vScale.x);

	float sstep = vScale.x / steps;
	float j = floor((uv.x + gap) * steps);

	colB.a -= crop(uvs.x, sstep * j - gap / 2.0, sstep * j + gap / 2.0);

	// colB = vec4(1.0 * step * i, 0.0, 0.0, 1.0);
	// if (uvs.x > sstep * j - gap * 0.5 && uvs.x < sstep * j + gap * 0.5) colB.b = 0.5;

	// float a = sstep * j;
	// if (uvs.x > a - gap && uvs.x < a + gap) colB.b = 0.5;
	// if (j == 0.0) colB.b = 0.0;
	// if (j == steps) colB.b = 0.0;


	color += colB * when_eq(uWireframe, 0.0);
	color += vec4(1.0) * when_eq(uWireframe, 1.0);

	gl_FragColor = color;
	
}
