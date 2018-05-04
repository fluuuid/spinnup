// Created by @brunoimbrizi
// Based on https://www.shadertoy.com/view/lsl3RH by inigo quilez - iq/2013

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

varying vec2 vUv;

uniform float uTime;
uniform float uKnobA;
uniform float uKnobB;
uniform float uKnobC;
uniform sampler2D uTexture;

vec2 barrelDistort(vec2 pos, float power) {
	float t = atan(pos.y, pos.x);
	float r = pow(length(pos), power);
	pos.x   = r * cos(t) * uKnobC;
	pos.y   = r * sin(t) * uKnobC * 2.0;
	return uKnobC * (pos + 1.0);
}

const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

float wave(vec2 p) {
	return sin(p.x) * cos(p.y);
}

float fbm4(vec2 p) {
    float f = 0.0;
    f += 0.5000 * wave(p); p = m * p * 2.02;
    f += 0.2500 * wave(p); p = m * p * 2.03;
    f += 0.1250 * wave(p); p = m * p * 2.01;
    f += 0.0625 * wave(p);
    return f / 0.9375;
}

float fbm6(vec2 p) {
    float f = 0.0;
    f += 0.500000 * (0.5 + 0.5 * wave(p)); p = m * p * 2.02;
    f += 0.250000 * (0.5 + 0.5 * wave(p)); p = m * p * 2.03;
    f += 0.125000 * (0.5 + 0.5 * wave(p)); p = m * p * 2.01;
    f += 0.062500 * (0.5 + 0.5 * wave(p)); p = m * p * 2.04;
    f += 0.031250 * (0.5 + 0.5 * wave(p)); p = m * p * 2.01;
    f += 0.015625 * (0.5 + 0.5 * wave(p));
    return f / 0.96875;
}

float func(vec2 q) {
    float ql = length(q);
    q.x += 0.05 * sin(0.27 * uTime + ql * 4.1);
    q.y += 0.05 * sin(0.23 * uTime + ql * 4.3);
    q *= 0.5 * uKnobB;

	vec2 o = vec2(0.0);
    o.x = 0.5 + 0.5 * fbm4(vec2(2.0 * q));
    o.y = 0.5 + 0.5 * fbm4(vec2(2.0 * q+vec2(5.2)));

	float ol = length(o);
    o.x += 0.02 * sin(0.12 * uTime + ol) / ol;
    o.y += 0.02 * sin(0.14 * uTime + ol) / ol;

    vec2 n;
    n.x = fbm6(vec2(4.0 * o + vec2(9.2)));
    n.y = fbm6(vec2(4.0 * o + vec2(5.7)));

    vec2 p = 4.0 * q + 4.0 * n;

    float f = 0.5 + 0.5 * fbm4(p);

    // f = mix(f, f * f * f * 3.5, f * abs(n.x));

    // float g = 0.5 + 0.5 * sin(4.0 * p.x) * sin(8.0 * p.y);
    // f *= 1.0 - 0.5 * pow(g, 4.0);

    return f;
}

void main() {
    vec2 uv = vUv;

    // color A
    float barrel_pow = min(1.0, 1.2 * uKnobB);
    vec2 p = -1.0 + 2.0 * uv;
    float d = length(p);
    float s = 1.0 - min(1.0, d * d);

	p = barrelDistort(p, barrel_pow);

    float t = snoise2(uv + uTime * 0.25);

    vec2 uvA = (p-uv) + uv;
    vec3 colA = texture2D(uTexture, uvA * 1.0 + t * 0.01).rgb;

    // color B
    vec2 q = -1.0 + 1.0 * uv;
    // q.x *= -2.0;
    q *= 0.1;
    float f = func(q);
    vec2 uvB = uv * uKnobA + (1.0 - uKnobA) / 2.0;
    vec3 colB = texture2D(uTexture, uvB * -0.8 + 0.6 + f).rgb;

    // final color
    vec3 color = mix(colA, colB, (t + 1.0) / 2.0);
    // color = colA;

    gl_FragColor = vec4( color, 1.0 );
}
