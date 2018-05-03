#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

varying vec2 vUv;

uniform float uTime;
uniform sampler2D uTexture;

float level(float source) {
    const float iterations = 4.0;
    float val = 0.0;
    float number = 1.0 / iterations;
    for (float i = 0.0; i < iterations; i++) {
        val += step(source, i * number);
    }
    return val / iterations;
}

void main()
{
    vec2 uv = vUv;
    float time = uTime * 0.25;

    float t = snoise2(uv + time);

    // vec3 col = vec3(level(t * 0.5));
    vec3 col = vec3(level(snoise2(uv) + t * length(uv)));
    // vec3 col = vec3(snoise2(vec2(uTime, uTime * 0.1)));
    
    vec3 col2 = texture2D(uTexture, col.rg * vec2(uv.x * -0.5 + 1.0, uv.y * 0.5)).rgb;
    vec3 col1 = texture2D(uTexture, uv + snoise2(uv + time) * 0.01).rgb;

    vec3 color = mix(col1, col2, t);
    
    gl_FragColor = vec4(color, 1.0);
}