// Created by @brunoimbrizi / brunoimbrizi.com

attribute float displacement;

varying vec2 vUv;

void main() {
	vUv = uv;

	vec3 pos = position;
	// pos.y *= displacement;
	pos.y += displacement;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
