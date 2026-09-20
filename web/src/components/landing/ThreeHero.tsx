import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ThreeHero() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    // ── Scene ──
    const scene = new THREE.Scene()
    scene.background = null // transparent so CSS bg shows

    const camera = new THREE.PerspectiveCamera(70, el.clientWidth / el.clientHeight, 0.1, 200)
    camera.position.set(0, 0, 12)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // ── Tunnel geometry ──
    // Use a tube following a path that curves downward (mine shaft)
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 8, -80),
      new THREE.Vector3(2, 4, -60),
      new THREE.Vector3(-1, 0, -40),
      new THREE.Vector3(1, -3, -20),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 4, 20),
    ])

    const tubeGeometry = new THREE.TubeGeometry(path, 200, 3.5, 18, false)
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a1208,
      side: THREE.BackSide,
      wireframe: false,
    })
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    scene.add(tube)

    // Wireframe overlay for the orange grid effect
    const wireGeometry = new THREE.TubeGeometry(path, 80, 3.5, 12, false)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial)
    scene.add(wireMesh)

    // ── Particles: signal stream ──
    const particleCount = 300
    const positions = new Float32Array(particleCount * 3)
    const particleSpeeds = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const t = Math.random()
      const point = path.getPoint(t)
      const spread = 2.5
      positions[i * 3] = point.x + (Math.random() - 0.5) * spread
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * spread
      positions[i * 3 + 2] = point.z
      particleSpeeds[i] = 0.001 + Math.random() * 0.002
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Leading signal orb ──
    const orbGeo = new THREE.SphereGeometry(0.12, 16, 16)
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    const orb = new THREE.Mesh(orbGeo, orbMat)
    const orbLight = new THREE.PointLight(0xf97316, 3, 8)
    orb.add(orbLight)
    scene.add(orb)

    // ── Camera path animation ──
    let cameraT = 0.6 // Start the camera partway through the tunnel
    let orbT = 0.0   // Orb starts at the bottom

    const clock = new THREE.Clock()
    let raf: number

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      // Camera slowly moves forward along the path
      cameraT += delta * 0.012
      if (cameraT > 0.95) cameraT = 0.55

      const camPos = path.getPoint(cameraT)
      const camLookAt = path.getPoint(Math.min(cameraT + 0.05, 1))
      camera.position.copy(camPos)
      camera.lookAt(camLookAt)

      // Orb races up the tunnel (opposite direction — "alert going to surface")
      orbT += delta * 0.22
      if (orbT > 1) orbT = 0
      const orbPos = path.getPoint(orbT)
      orb.position.copy(orbPos)

      // Particle drift (gentle radial motion inside tube)
      const posArr = particleGeo.attributes.position.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 2] += particleSpeeds[i] * 60 * delta
        // Wrap when particle exits the tube bounds
        if (posArr[i * 3 + 2] > 20) {
          const t = Math.random() * 0.3
          const pt = path.getPoint(t)
          posArr[i * 3] = pt.x + (Math.random() - 0.5) * 2.5
          posArr[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 2.5
          posArr[i * 3 + 2] = pt.z
        }
      }
      particleGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    // ── Resize ──
    const onResize = () => {
      if (!el) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      tubeGeometry.dispose()
      tubeMaterial.dispose()
      wireGeometry.dispose()
      wireMaterial.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      orbGeo.dispose()
      orbMat.dispose()
      if (el && renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
