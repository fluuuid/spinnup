// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: when_eq = require(glsl-conditionals/when_eq)

varying vec2 vUv;

uniform sampler2D uTexture;
uniform float uWireframe;

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	// logo
	vec4 tex = texture2D(uTexture, uv);
	vec4 colB = vec4(vec3(1.0), tex.g);

	color += colB * when_eq(uWireframe, 0.0);
	color += vec4(1.0) * when_eq(uWireframe, 1.0);

	gl_FragColor = color;
}
