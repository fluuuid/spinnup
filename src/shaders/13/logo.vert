// Created by @brunoimbrizi / brunoimbrizi.com

uniform sampler2D uData;

varying vec2 vUv;

void main() {
	vUv = uv;

	vec4 tex = texture2D(uData, uv);
	vec3 pos = position;
	pos.xy += pos.xy * tex.r;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
