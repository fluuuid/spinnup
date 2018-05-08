// Created by @brunoimbrizi / brunoimbrizi.com

#define PI 3.141592
#define HALF_PI PI / 2.0

varying vec2 vUv;

uniform float uRows;
uniform float uKnobD;
uniform sampler2D uTexture;

void main() {
	vec2 uv = vUv;
	vec4 color;

	// displacement map
	// float k = floor(fract(uv.y * uRows) + 0.5);
	// float k = fract(uv.y * uRows);
	float k = (sin(uv.y * uRows * PI) + 1.0) / 2.0;
	k += (cos(uv.x * 10.0 * PI) + 1.0) / 2.0;
	// k /= 2.0;
	k -= 1.0;

	vec4 colA = vec4(k, k, k, 1.0);
	vec2 uvk = vec2(uv.x + k * uKnobD, uv.y + k * uKnobD * 2.0);

	// logo
	vec4 tex = texture2D(uTexture, uvk);
	vec4 colB = mix(vec4(0.0), vec4(1.0), tex.g);

	color = colB;
	// color = colA;

	gl_FragColor = color;

}