// Created by @brunoimbrizi / brunoimbrizi.com

varying vec2 vUv;

uniform sampler2D uTexture;

void main() {
	vec2 uv = vUv;
	
	gl_FragColor = texture2D(uTexture, uv);
	
	// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}