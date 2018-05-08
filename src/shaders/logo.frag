// Created by @brunoimbrizi / brunoimbrizi.com

#pragma glslify: ease = require(glsl-easings/quartic-in-out)
#pragma glslify: when_eq = require(glsl-conditionals/when_eq)

#define PI 3.141592
#define HALF_PI PI / 2.0

varying vec2 vUv;

uniform float uRows;
uniform float uCols;
uniform float uDisplacement;
uniform float uKnobD;
uniform sampler2D uTexture;

void main() {
	vec2 uv = vUv;
	vec4 color;

	// displacement map

	// straight
	float ka = floor(fract(uv.y * uRows) + 0.5);
	// sawtooth
	float kb = fract(uv.y * uRows);
	// sine
	float kc = (sin(uv.y * uRows * PI) + sin(uv.x * uCols * PI)) / 2.0;
	// quartic
	float kd = (ease(sin(uv.y * uRows * PI)) - ease(sin(uv.x * uCols * PI))) / 8.0;

	// switch / case
	float k = 0.0;
	k += ka * when_eq(uDisplacement, 0.0);
	k += kb * when_eq(uDisplacement, 1.0);
	k += kc * when_eq(uDisplacement, 2.0);
	k += kd * when_eq(uDisplacement, 3.0);

	// draw displacement map
	vec4 colA = vec4(k, k, k, 1.0);
	color = colA;

	// displaced uv
	vec2 uvk = vec2(uv.x + k * uKnobD, uv.y + k * uKnobD);

	// logo
	vec4 tex = texture2D(uTexture, uvk);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);

	// color = colB;

	gl_FragColor = color;

}