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
uniform float uSparkleIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vTangent;
varying vec3 vBitangent;

const float PI = 3.14159265359;

void main() {
  vec3 color = texture2D(uColorMap, vUv).rgb;
  vec3 normalMap = texture2D(uNormalMap, vUv).rgb;
  normalMap = normalize(normalMap * 2.0 - 1.0);
  
  mat3 TBN = mat3(normalize(vTangent), normalize(vBitangent), normalize(vWorldNormal));
  vec3 N = normalize(TBN * normalMap);
  
  float roughness = texture2D(uRoughnessMap, vUv).r * uRoughness;
  vec3 V = normalize(uViewPosition - vWorldPosition);
  vec3 L = normalize(uLightDir);
  vec3 H = normalize(V + L);
  
  vec3 radiance = uLightColor;
  float NdotL = max(dot(N, L), 0.0);
  vec3 diffuse = NdotL * radiance * color / PI;
  
  float spec = pow(max(dot(N, H), 0.0), 128.0 * (1.0 - roughness));
  vec3 specular = spec * radiance;
  
  float sparkle = pow(max(dot(N, H), 0.0), 128.0) * uSparkleIntensity;
  vec3 ambient = uAmbientLight * color;
  vec3 finalColor = ambient + (diffuse + specular + sparkle * uLightColor) * 0.8;
  
  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(1.0 / 2.2));
  gl_FragColor = vec4(finalColor, 1.0);
}

