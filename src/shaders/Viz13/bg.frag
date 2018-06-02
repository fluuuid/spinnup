// Created by @brunoimbrizi / brunoimbrizi.com
// Based on https://www.shadertoy.com/view/4dlfW4 by Lovax

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

#define PI 3.14159265359
#define EXP 2.71828182846

varying vec2 vUv;

uniform float uTime;
uniform float uAlpha;
uniform float uSaturation;
uniform vec2 uModA;
uniform sampler2D uTexture;

float w1 = 3.0;
float w2 = 1.0;
float w3 = 20.0;
float A = 1.0;
float R = 3.0;

float horizontal(in vec2 xy, float t)	{
    float v = cos(w1*xy.x + A*t);
	return v;
}
    
float diagonal(in vec2 xy, float t)	{
    float v = cos(w2*(xy.x*cos(t) + 5.0*xy.y*sin(t)) + A*t);
    return v;
}
float radial(in vec2 xy, float t)	{
    float x = 0.3*xy.x - 0.5 + cos(t);
    float y = 0.3*xy.y - 0.5 + sin(t*0.5);
    float v = sin(w3*sqrt(x*x+y*y+1.0)+A*t);
    return v;
}

float map(float a,float b,float c,float d,float x) {
    return ((x-a)*(d-c)/(b-a))+c;
}

float log_map(float a,float b,float c,float d,float x) {
    float x1 = map(a,b,1.0,EXP,x);
    return log(x1)*(d-c)+c;
}

vec2 mirror(vec2 v) {
	v += -v * 2.0 * when_lt(v, vec2(0.0));
	v += (2.0 - v * 2.0) * when_gt(v, vec2(1.0));
	return v;
}

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	vec2 uvr = uv;
	float t = uTime * 0.1;
    float v = horizontal(uvr, t);
    v += diagonal(uvr, t);
    v += radial(uvr, t);
    v /= 3.0;
    float r = map(-1.0, 1.0, 0.75, 1.0, sin(PI * v));
    float g = map(-1.0, 1.0, 0.0, 0.8, sin(PI * v));
    g += log_map(-1.0, 1.0, 0.0, 0.1, cos(PI * v));
    float b = map(-1.0, 1.0, 0.0, 0.1, sin(PI * v));

    float n = snoise2(uv + r + t);
    
    vec2 uva = mirror(uv + vec2(pow(g, R), pow(r, R) * 1.8) * 0.2 + uModA);
	vec4 colA = texture2D(uTexture, uva);

	vec2 uvb = mirror(uv - vec2(pow(r, 0.2) + 0.25, pow(g, R) * 0.1));
	uvb.y *= 0.9;
	vec4 colB = texture2D(uTexture, uvb);

	// mixed colors
    vec4 colC = mix(colA, colB, (n + 1.0) / 2.0);

	color = colC;

    // color.rgb *= uAlpha;
    color.rgb = mix(vec3(0.4), color.rgb, uAlpha);
    color.rgb = mix(color.rrr, color.rgb, uSaturation);

    gl_FragColor = color;
}
