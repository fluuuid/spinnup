// Created by @brunoimbrizi / brunoimbrizi.com

varying float vSteps;
varying float vGap;
varying vec2 vScale;
varying vec2 vUv;

void main() {
	vSteps = 2.0;
	vGap = 0.1;
	vScale = vec2(1.0 + vGap * (vSteps - 1.0), 1.0);
	vUv = uv;

	vec3 pos = position * vec3(vScale, 1.0);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
