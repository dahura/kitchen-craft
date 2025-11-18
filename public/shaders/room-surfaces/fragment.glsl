#version 330 core

uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;

uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbientLight;
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uViewPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

const float PI = 3.14159265359;

void main() {
  vec3 color = texture2D(uColorMap, vUv).rgb;
  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uLightDir);
  
  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = diff * uLightColor * color;
  vec3 ambient = uAmbientLight * color;
  
  vec3 V = normalize(uViewPosition - vWorldPosition);
  vec3 H = normalize(V + L);
  float spec = pow(max(dot(N, H), 0.0), 32.0 * (1.0 - uRoughness));
  
  vec3 finalColor = ambient + diffuse * 0.8 + spec * uLightColor * 0.2;
  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(1.0 / 2.2));
  gl_FragColor = vec4(finalColor, 1.0);
}

