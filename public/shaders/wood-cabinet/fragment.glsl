#version 330 core

uniform sampler2D uColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uMetalnessMap;
uniform sampler2D uAoMap;

uniform vec3 uLightDir;
uniform vec3 uLightColor;
uniform vec3 uAmbientLight;
uniform float uRoughness;
uniform float uMetalness;
uniform float uNormalMapIntensity;
uniform vec3 uViewPosition;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vTangent;
varying vec3 vBitangent;

const float PI = 3.14159265359;
const float EPSILON = 0.00001;

float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  return nom / max(denom, EPSILON);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  float nom = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  return nom / max(denom, EPSILON);
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = GeometrySchlickGGX(NdotV, roughness);
  float ggx1 = GeometrySchlickGGX(NdotL, roughness);
  return ggx1 * ggx2;
}

void main() {
  vec3 color = texture2D(uColorMap, vUv).rgb;
  vec3 normalMap = texture2D(uNormalMap, vUv).rgb;
  normalMap = normalize(normalMap * 2.0 - 1.0);
  normalMap = normalize(normalMap * uNormalMapIntensity + vec3(0.0, 0.0, 1.0 - uNormalMapIntensity));

  mat3 TBN = mat3(normalize(vTangent), normalize(vBitangent), normalize(vWorldNormal));
  vec3 N = normalize(TBN * normalMap);

  float roughness = texture2D(uRoughnessMap, vUv).r;
  roughness = mix(roughness, uRoughness, 0.5);

  float metalness = 0.0;
  metalness = mix(metalness, uMetalness, 0.5);

  vec3 V = normalize(uViewPosition - vWorldPosition);
  vec3 L = normalize(uLightDir);
  vec3 H = normalize(V + L);

  float distance = length(vWorldPosition - uViewPosition);
  float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
  vec3 radiance = uLightColor * attenuation;

  vec3 F0 = mix(vec3(0.04), color, metalness);

  float NDF = DistributionGGX(N, H, roughness);
  float G = GeometrySmith(N, V, L, roughness);
  vec3 F = fresnelSchlick(clamp(dot(H, V), 0.0, 1.0), F0);

  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metalness;

  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular = numerator / max(denominator, EPSILON);

  float NdotL = max(dot(N, L), 0.0);
  vec3 Lo = (kD * color / PI + specular) * radiance * NdotL;

  float ao = 1.0;
  vec3 ambient = uAmbientLight * color * ao;
  vec3 finalColor = ambient + Lo;

  finalColor = finalColor / (finalColor + vec3(1.0));
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

  gl_FragColor = vec4(finalColor, 1.0);
}
