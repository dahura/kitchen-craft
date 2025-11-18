#version 330 core

layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 uv;
layout(location = 3) in vec4 tangent;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTextureScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;
varying vec3 vTangent;
varying vec3 vBitangent;

void main() {
  vUv = uv * uTextureScale;
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vTangent = normalize(mat3(modelMatrix) * tangent.xyz);
  vBitangent = cross(vWorldNormal, vTangent) * tangent.w;

  vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
  vPosition = mvPosition.xyz;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * mvPosition;
}

