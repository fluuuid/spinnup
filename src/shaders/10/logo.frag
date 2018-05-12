// Created by @brunoimbrizi / brunoimbrizi.com

varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	// logo
	vec4 tex = texture2D(uTexture, uv);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);

	color = colB;

	gl_FragColor = color;
	
}
