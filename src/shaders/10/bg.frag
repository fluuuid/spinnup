// Created by @brunoimbrizi / brunoimbrizi.com
// Based on https://www.shadertoy.com/view/XlXSzn by FabriceNeyret2

#define PI 3.14159265
#define TILE_SIZE 16.0

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: when_lt = require(glsl-conditionals/when_lt)
#pragma glslify: when_gt = require(glsl-conditionals/when_gt)

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;

/*
const mat3 m = mat3( 0.00,  0.80,  0.60,
           		    -0.80,  0.36, -0.48,
             		-0.60, -0.48,  0.64 );

float hash( float n ) {
    return fract(sin(n)*43758.5453);
}

float noise( in vec3 x ) { // in [0,1]
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f*f*(3.-2.*f);

    float n = p.x + p.y*57. + 113.*p.z;

    float res = mix(mix(mix( hash(n+  0.), hash(n+  1.),f.x),
                        mix( hash(n+ 57.), hash(n+ 58.),f.x),f.y),
                    mix(mix( hash(n+113.), hash(n+114.),f.x),
                        mix( hash(n+170.), hash(n+171.),f.x),f.y),f.z);
    return res;
}

float fbm( vec3 p ) { // in [0,1]
    float f;
    f  = 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );
    return f;
}
// --- End of: Created by inigo quilez --------------------

vec2 sfbm2( vec3 p ) {
    return 2.*vec2(fbm(p),fbm(p-327.67))-1.;
}


void main() {
    // vec2 uv = vUv;

    float t = uTime;

	vec2 uv = 1.0 * (vUv.xy / 1.0) - vec2(-0.5, 0.5);
    // float a = .5*t, c=cos(a), s=sin(a);
    // uv *= mat2(c,-s,s,c);
    
    vec4 col=vec4(0.);
    vec3 paint = vec3(.3,.9,.7);
    
    // int i=0; for(float z=0.; z<1.; z+= 1./3.) {
    float z = 0.0;
        vec2 duv = vec2(0.8, 0.5) * sfbm2(vec3(1.2*uv,7.*z+t)) - 3.*z;
        
    	float d = abs(length(uv+duv)-1.2*(1.-z)),
              a = smoothstep(.2,.29,d); 
        
        d = a-.5*smoothstep(.18,.17,d) +.5*smoothstep(.02,.01,d);
        
        // col += vec4(d * paint, a);
    	col += texture2D(uTexture, vUv * d * 1.0);
    // }

    vec4 color = col;

    gl_FragColor = color;
}
*/

/*

vec4 downsample(sampler2D sampler, vec2 uv, float pixelSize) {
    // return texture2D(sampler, uv - step(uv, vec2(pixelSize) / iResolution.xy));
    return texture2D(sampler, vec2(uv.x, uv.y - step(uv.y, pixelSize)));
}

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
  	float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float random2d(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float randomRange (in vec2 seed, in float min, in float max) {
		return min + random2d(seed) * (max - min);
}

float insideRange(float v, float bottom, float top) {
   return step(bottom, v) - step(top, v);
}

const float AMT = 0.2;
float SPEED = 0.1;

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

void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	vec2 c = vec2(uv.x - 2.5, uv.y - 1.5);
	vec2 n = vec2(log(sqrt(c.x * c.x + c.y * c.y)), atan(c.x, c.y));

	// float PI = 3.141592;

	float d = 0.0;

	d += cos(10.0 * c.y + uTime);
	d += cos(2.0 * c.x - uTime);
	d += cos(5.0 * n.y - uTime);
	d += cos(6.0 * n.x - uTime);
	// d += snoise2(vec2(0.1 * n.y + uTime * 0.1, 1.2 * c.x - uTime * 0.1));
	// d += cos(2500.0 * n.y + uTime);

	vec2 uvd = vec2(uv.x * 0.9 - d * 0.01 + 0.05, uv.y + sin(d + uTime) * 0.1);

	vec2 duv = vec2(0.8, 0.5) * fbm4(1.2 * uvd + uTime * 0.1) * 0.2;
	// duv.x = 0.0;

	// d += duv.x;
	
	// float t = fbm4(uvd + uTime * 0.25);
	float t = 0.5 * fbm4(vec2(2.0 * uv + vec2(5.2)));
	// uvd.y -= t;

	vec2 uvc = vec2(step(0.5, uv.x), uv.y);

	vec4 colA = texture2D(uTexture, uvd);
	vec4 colB = texture2D(uTexture, uvd + duv);
	vec4 colC = texture2D(uTexture, uvc);
	
	// color = vec4(sin(d + uTime), d, 0.0, 1.0);
	
	// color = mix(colA, colB, (t + 1.0) / 2.0);
	color = colA;

	// gl_FragColor = vec4(sin(d + uTime / 100.0) * 90.75, d, sin(d + uTime / 36.0) * 9.75, 1.0);

    float wow = clamp(mod(noise(uTime + uv.y), 1.0), 0.0, 1.0) * 2.0 - 1.0;    

    // uv.y += fract(uTime);
    float sampleSize = 0.01 * wow;
    float dx = sampleSize;
    // color = mix(downsample(uTexture, uv - vec2(dx, 0.0), sampleSize), downsample(uTexture, uv + vec2(dx, 0.0), sampleSize), mod(uv.x, dx) / dx);
    // color = texture2D(uTexture, uv);

    //randomly offset slices horizontally
    float time = floor(uTime * SPEED * 60.0);

    float maxOffset = AMT/2.0;
    for (float i = 0.0; i < 10.0 * AMT; i += 1.0) {
        float sliceY = random2d(vec2(time, 2345.0 + float(i)));
        float sliceH = random2d(vec2(time, 9035.0 + float(i))) * 0.25;
        float hOffset = randomRange(vec2(time , 9625.0 + float(i)), -maxOffset, maxOffset);
        vec2 uvOff = uvd + duv;
        uvOff.y += hOffset;
        if (insideRange(uv.x, sliceY, fract(sliceY+sliceH)) == 1.0 ){
        	color = texture2D(uTexture, uvOff);
        }
    }

    gl_FragColor = color;
}
*/

const mat2 m = mat2(0.80,  0.60, -0.60,  0.80);

float rand(float n) {
    return fract(sin(n) * 43758.5453123);
}

float noise(float p) {
    float fl = floor(p);
  	float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

float crop(float x, float min, float max) {
	return 1.0 * step(min, x) * (1.0 - step(max, x));
}

float wave(vec2 p) {
	return sin(p.x) * cos(p.y);
}

float fbm4(vec2 p) {
    float f = 0.0;
    f += 1.5000 * wave(p); p = m * p * 2.02;
    f += 0.2500 * wave(p); p = m * p * 2.03;
    f += 0.1250 * wave(p); p = m * p * 2.01;
    f += 0.0625 * wave(p);
    return f * 0.9375;
}

vec2 mirror(vec2 v) {
	v += -v * 2.0 * when_lt(v, vec2(0.0));
	v += (2.0 - v * 2.0) * when_gt(v, vec2(1.0));
	return v;
}


void main() {
	vec2 uv = vUv;
	vec4 color = vec4(0.0);

	const float steps = 40.0;
	const float size = 1.0 / steps;

	/*
	for (float i = 0.0; i < 1.0; i += size) {
		vec2 offset = vec2(0.0, sin(uTime + i * 10.0) * 0.1);
		color += texture2D(uTexture, fract(uv + offset)) * crop(uv.x, i, i + size);
	}
	*/
	float i = floor(uv.x / size) * 0.1;

	float wow = clamp(mod(noise(uTime + uv.y), 1.0), 0.0, 1.0) * 2.0 - 1.0;

	vec2 duv = vec2(0.8, 0.5) * fbm4(1.2 * uv + i + uTime * 0.1);

	// vec2 offset = vec2(0.0, duv.y);
	vec2 offset = vec2(duv.x * wow * 0.05, duv.y);
	// color += texture2D(uTexture, fract(uv + offset));
	color += texture2D(uTexture, mirror(uv + offset));

    
    gl_FragColor = color;
}
