// Created by @brunoimbrizi / brunoimbrizi.com
// Based on https://www.shadertoy.com/view/lsl3RH by inigo quilez - iq/2013

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: when_eq = require(glsl-conditionals/when_eq)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)


varying vec2 vUv;

uniform float uTime;
uniform float uModA;
uniform float uModB;
uniform float uModC;
uniform vec2 uModD;
uniform float uDebug;
uniform sampler2D uTexture;

vec2 barrelDistort(vec2 pos, float power) {
	float t = atan(pos.y, pos.x);
	float r = pow(length(pos), power);
	pos.x   = r * cos(t) * uModC;
	pos.y   = r * sin(t) * uModC * 2.0;
	return uModC * (pos + 1.0);
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
    q *= 0.5 * uModB;

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

vec2 mirror(vec2 v) {
    v += -v * 2.0 * when_lt(v, vec2(0.0));
    v += (2.0 - v * 2.0) * when_gt(v, vec2(1.0));
    return v;
}

void main() {
    vec2 uv = vUv;

    // color A
    float barrel_pow = min(1.0, 1.2 * uModB);
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
    vec2 uvB = uv * uModA + (1.0 - uModA) / 2.0;
    vec3 colB = texture2D(uTexture, mirror(uvB * uModD.x + uModD.y + f)).rgb;

    // mixed colors
    vec3 colC = mix(colA, colB, (t + 1.0) / 2.0);

    vec3 color = vec3(0.0);
    color += colC * when_eq(uDebug, 0.0);
    color += colA * when_eq(uDebug, 1.0);
    color += colB * when_eq(uDebug, 2.0);
    color += texture2D(uTexture, uv).rgb * when_eq(uDebug, 3.0);

    gl_FragColor = vec4(color, 1.0);
}
