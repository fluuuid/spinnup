// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: when_eq = require(glsl-conditionals/when_eq)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uWireframe;

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	// logo
	vec4 tex = texture2D(uTexture, uv);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);
	colB.a = 1.0 - step(tex.b, 0.75); // clear edges
	// colB.rgb = vec3(0.0);

	color += colB * when_eq(uWireframe, 0.0);
	color += vec4(1.0) * when_eq(uWireframe, 1.0);

	gl_FragColor = color;
	
}
