'use client';

import React, { Component, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Floating Crystal / Diamond Shape ───────────────────────────────────── */
function DiamondGeometry() {
  return useMemo(() => {
    const geo = new THREE.ConeGeometry(1, 1.4, 6);
    const bottomGeo = new THREE.ConeGeometry(1, 0.7, 6);
    bottomGeo.rotateX(Math.PI);
    bottomGeo.translate(0, -0.35, 0);
    geo.merge && geo;
    return geo;
  }, []);
}

function FloatingCrystal({ position, scale = 1, speed = 1, color = '#EEBEC6' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.15;
      meshRef.current.position.y = (window.scrollY || 0) * 0.002 * speed;
    }
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          resolution={256}
          transmission={0.95}
          roughness={0.05}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.08}
          anisotropy={0.3}
          color={color}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
        />
      </mesh>
    </Float>
  );
}

/* ─── Floating Torus (ring) ──────────────────────────────────────────────── */
function FloatingRing({ position, scale = 1, speed = 1, color = '#A8D6EF' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005 * speed;
      meshRef.current.rotation.z += 0.003 * speed;
      const scrollOffset = (window.scrollY || 0) * 0.003 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7 * speed) * 0.15 + scrollOffset;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.35, 16, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        roughness={0.15}
        metalness={0.3}
      />
    </mesh>
  );
}

/* ─── Floating Sphere ────────────────────────────────────────────────────── */
function FloatingSphere({ position, scale = 1, speed = 1, color = '#CFD3ED' }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const scrollOffset = (window.scrollY || 0) * 0.0025 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 * speed) * 0.2 + scrollOffset;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3 * speed) * 0.1;
    }
  });

  return (
    <Float speed={1.2 * speed} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
    </Float>
  );
}

/* ─── Animated particle field ────────────────────────────────────────────── */
function ParticleField({ count = 80 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 20, // Widened spread
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 8,
        speed: 0.2 + Math.random() * 0.4,
        scale: 0.02 + Math.random() * 0.04,
        scrollFactor: 0.5 + Math.random() * 2.5 // Add parallax factor
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const scrollY = window.scrollY || 0;
    
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + i) * 0.3,
        p.y + Math.cos(t * p.speed * 0.8 + i * 0.5) * 0.4 + (scrollY * 0.005 * p.scrollFactor),
        p.z
      );
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 2 + i) * 0.3));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#E7B7D6"
        transparent
        opacity={0.6}
        roughness={0.5}
      />
    </instancedMesh>
  );
}

/* ─── Main 3D Scene ──────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#FFD9CC" />
      <directionalLight position={[-3, 2, -5]} intensity={0.4} color="#A8D6EF" />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#EEBEC6" />

      {/* Main crystal — moved right */}
      <FloatingCrystal position={[5.5, 1, -1]} scale={0.8} speed={0.8} color="#EEBEC6" />
      
      {/* Secondary crystal — moved left */}
      <FloatingCrystal position={[-5.5, -0.8, -2]} scale={0.5} speed={1.2} color="#CFD3ED" />

      {/* Rings — pushed outwards */}
      <FloatingRing position={[4.5, -2, -3]} scale={0.4} speed={0.6} color="#A8D6EF" />
      <FloatingRing position={[-4, 2.5, -2]} scale={0.3} speed={0.9} color="#EEBEC6" />

      {/* Spheres — distributed as a frame */}
      <FloatingSphere position={[6, 2.5, -4]} scale={0.35} speed={0.7} color="#8BD2F0" />
      <FloatingSphere position={[-6, -2.5, -3]} scale={0.25} speed={1.1} color="#FFD9CC" />
      <FloatingSphere position={[-3.5, 3.5, -5]} scale={0.45} speed={0.5} color="#E7B7D6" />

      {/* Particle field with slightly more particles to cover the wider spread */}
      <ParticleField count={100} />
    </>
  );
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('WebGL or Canvas failed to initialize:', error);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

/* ─── Export: Canvas wrapper ─────────────────────────────────────────────── */
export default function HeroScene() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "default" }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
