import React from "react";
import { AbsoluteFill, Composition, interpolate, registerRoot, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const INK = "#10162e";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

const Part = ({ geo, color, outline = 1.07, ...p }) => (
  <group {...p}>
    <mesh>{geo}<meshToonMaterial color={color} /></mesh>
    <mesh scale={outline}>{geo}<meshBasicMaterial color={INK} side={THREE.BackSide} /></mesh>
  </group>
);

const Hero = ({ frame, walk }) => {
  const wave = Math.sin(frame / 4) * 0.3;
  const bob = Math.sin(frame / 15) * 0.03;
  return (
    <group position={[0, bob, 0]}>
      <group position={[-0.22, 1.0, 0]} rotation={[walk, 0, 0]}>
        <Part position={[0, -0.45, 0]} geo={<capsuleGeometry args={[0.15, 0.6, 8, 16]} />} color="#2b3a67" />
      </group>
      <group position={[0.22, 1.0, 0]} rotation={[-walk, 0, 0]}>
        <Part position={[0, -0.45, 0]} geo={<capsuleGeometry args={[0.15, 0.6, 8, 16]} />} color="#2b3a67" />
      </group>
      <Part position={[0, 1.4, 0]} geo={<capsuleGeometry args={[0.42, 0.5, 8, 16]} />} color="#35d0c0" />
      <group position={[-0.5, 1.8, 0]} rotation={[0, 0, -0.2]}>
        <Part position={[0, -0.36, 0]} geo={<capsuleGeometry args={[0.11, 0.5, 8, 16]} />} color="#35d0c0" />
      </group>
      <group position={[0.5, 1.8, 0]} rotation={[0, 0, 2.4 + wave]}>
        <Part position={[0, -0.36, 0]} geo={<capsuleGeometry args={[0.11, 0.5, 8, 16]} />} color="#35d0c0" />
      </group>
      <Part position={[0, 2.3, 0]} geo={<sphereGeometry args={[0.5, 32, 32]} />} color="#f2c9a0" />
      <Part position={[0, 2.32, 0]} rotation={[-0.35, 0, 0]} outline={1.03}
        geo={<sphereGeometry args={[0.53, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />} color="#2a2018" />
      <mesh position={[-0.17, 2.35, 0.45]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={INK} /></mesh>
      <mesh position={[0.17, 2.35, 0.45]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={INK} /></mesh>
      <mesh position={[0, 2.2, 0.47]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} /><meshBasicMaterial color="#5a2a2a" /></mesh>
    </group>
  );
};

const Store = () => (
  <group position={[1.1, 0, -0.6]}>
    <Part position={[0, 0.7, 0]} geo={<boxGeometry args={[1.5, 1.4, 0.9]} />} color="#2b3a67" />
    <Part position={[0, 1.45, 0.1]} geo={<boxGeometry args={[1.7, 0.14, 1.1]} />} color="#ff5a6e" />
    <Part position={[0, 1.85, 0.2]} geo={<boxGeometry args={[1.0, 0.28, 0.1]} />} color="#ffcc33" />
    <Part position={[0.4, 0.4, 0.47]} geo={<boxGeometry args={[0.4, 0.8, 0.05]} />} color={INK} />
    <Part position={[-0.35, 0.6, 0.47]} geo={<boxGeometry args={[0.6, 0.5, 0.05]} />} color="#bfe6ff" />
  </group>
);

const World = () => {
  const frame = useCurrentFrame();
  const heroX = interpolate(frame, [0, 40], [-4.5, -0.9], clamp);
  const walk = frame < 40 ? Math.sin(frame / 2) * 0.5 : 0;
  return (
    <>
      <color attach="background" args={["#0b1020"]} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 6, 6]} intensity={2.4} />
      <Part position={[0, -0.1, 0]} geo={<boxGeometry args={[7, 0.2, 5]} />} color="#1a2145" />
      <group position={[heroX, 0, 0.5]}><Hero frame={frame} walk={walk} /></group>
      <Store />
      <group position={[1.1, 3.4 + Math.sin(frame / 12) * 0.1, 0]} rotation={[0, frame / 10, 0]}>
        <Part rotation={[Math.PI / 2, 0, 0]} geo={<cylinderGeometry args={[0.55, 0.55, 0.14, 48]} />} color="#ffcc33" />
      </group>
    </>
  );
};

const Pilot = () => (
  <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
    <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 2.2, 11], fov: 35 }}>
      <World />
    </ThreeCanvas>
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 900, fontSize: 260, color: "#ffcc33" }}>$9.99</div>
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition id="Pilot3D" component={Pilot} durationInFrames={150} fps={30} width={1080} height={1920} />
));
