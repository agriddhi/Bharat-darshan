/* ============================================================
   scene/Particles.tsx — ambient dust.

   The brief asks for "a handful of tasteful dust particles, nothing
   busy". That is a real constraint: too many and the field looks like
   a screensaver, too few and the depth of the scene has nothing to
   measure against.

   200 motes, drifting as one slow cloud rather than each on its own
   path. Rotating a single group costs almost nothing, whereas giving
   every particle its own velocity would be 200 things to update per
   frame for a difference nobody would notice at this scale.
   ============================================================ */

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const COUNT = 200
const SPREAD = 62
const HEIGHT = 26

export function Particles() {
  const group = useRef<THREE.Group>(null)

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Uniform across the field, biased slightly toward the middle so
      // the dust gathers where the monuments are rather than framing
      // an empty border.
      const r = Math.pow(Math.random(), 0.65) * SPREAD
      const a = Math.random() * Math.PI * 2
      positions[i * 3] = Math.cos(a) * r
      positions[i * 3 + 1] = Math.random() * HEIGHT
      positions[i * 3 + 2] = Math.sin(a) * r
      sizes[i] = 0.045 + Math.random() * 0.075
    }
    return { positions, sizes }
  }, [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return

    // one slow rotation for the whole cloud...
    g.rotation.y += delta * 0.012

    // ...and an almost imperceptible rise-and-fall, so the field feels
    // like it is breathing rather than spinning
    g.position.y = Math.sin(state.clock.elapsedTime * 0.16) * 0.5
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={COUNT}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          color="#DEA044"
          transparent
          opacity={0.34}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}
