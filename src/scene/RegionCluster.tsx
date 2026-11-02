/* ============================================================
   scene/RegionCluster.tsx — one region's pocket of the field.

   Two jobs:
   1. A soft coloured disc on the ground in the region's mood colour.
      This is the "fog tint" from the brief — a local haze that makes
      each group read as a place rather than as dots on a plane.
   2. The region's name, as a DOM label.

   WHY THE LABEL IS DOM AND NOT three.js TEXT
   troika (which backs drei's <Text>) loads a font file. The project
   runs offline with no network calls, so pulling a font from a CDN at
   runtime would break that guarantee and, on a bad connection, leave
   the labels blank. <Html> uses the page's own fonts instead — the
   same ones the rest of the interface uses — so the labels are styled
   by tokens.css and need no extra asset.
   ============================================================ */

import * as THREE from 'three'
import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { REGION_HEX, type RegionName } from '../data/types'

/* --- soft radial falloff, so the disc has no hard edge ---
   A plain circle mesh would show a visible rim and look like a decal.
   This fades from the centre outward and squares the curve so the
   middle stays readable while the edge dissolves into the fog. */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3  uColor;
  uniform float uOpacity;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 2.2);
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`

interface Props {
  region: RegionName
  x: number
  z: number
  count: number
  /** 0..1 — drops when the region is filtered out. */
  emphasis: number
}

export function RegionCluster({ region, x, z, count, emphasis }: Props) {
  const color = REGION_HEX[region]

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: 0.34 },
    }),
    [color]
  )

  // A busier region gets a slightly larger, slightly stronger pool, so
  // the eye can find the dense groups before reading any label.
  const radius = 6.2 + Math.min(count, 7) * 0.55

  return (
    <group position={[x, 0, z]}>
      {/* the mood haze */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[radius, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
        />
      </mesh>

      {/* region name — DOM label, styled by tokens.css */}
      <Html
        position={[0, 0.05, -radius * 0.82]}
        center
        distanceFactor={26}
        zIndexRange={[10, 0]}
        style={{
          pointerEvents: 'none',
          opacity: 0.25 + emphasis * 0.75,
          transition: 'opacity var(--dur-filter) var(--ease-glide)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--soft-stone)',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 8px rgba(14,22,38,.95)',
            opacity: 0.9,
          }}
        >
          {region}
        </div>
      </Html>
    </group>
  )
}
