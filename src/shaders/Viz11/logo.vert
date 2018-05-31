// Created by @brunoimbrizi / brunoimbrizi.com

uniform vec2 uSteps;
uniform vec2 uOffset;

varying vec2 vScale;
varying vec2 vUv;

void main() {
	vScale = vec2(1.0 + uOffset.x * (uSteps.x - 1.0), 1.0 + uOffset.y * (uSteps.y - 1.0));
	vUv = uv;

	vec3 pos = position * vec3(vScale, 1.0);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
