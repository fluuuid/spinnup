// Created by @brunoimbrizi / brunoimbrizi.com

attribute float equaliser;

varying vec2 vUv;

void main() {
	vUv = uv;

	vec3 pos = position;
	// pos.y *= equaliser;
	pos.y += equaliser;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
