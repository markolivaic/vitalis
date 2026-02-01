/**
 * File: holographic-body-3d.tsx
 * Description: 3D holographic human body visualization with muscle fatigue status.
 */

"use client";

import { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Float, Html, Environment } from "@react-three/drei";
import { GlassCard } from "@/components/ui/glass-card";
import { useBodyStore } from "@/lib/stores/body.store";
import type { BodyStatus, MuscleStatus } from "@/lib/types";
import { Activity, Loader2 } from "lucide-react";
import * as THREE from "three";

interface HolographicBody3DProps {
  aiMessage: string;
}

const getBodyPartColor = (status: MuscleStatus) => {
  switch (status) {
    case "fatigued": return new THREE.Color("#ff6b35").multiplyScalar(4);
    case "recovering": return new THREE.Color("#3b82f6").multiplyScalar(3);
    case "target": return new THREE.Color("#a855f7").multiplyScalar(4);
    default: return new THREE.Color("#10b981").multiplyScalar(0.5);
  }
};

function HologramMaterial({ status }: { status: MuscleStatus }) {
  const color = useMemo(() => getBodyPartColor(status), [status]);
  const isFresh = status === 'fresh';
  const isFatigued = status === 'fatigued';

  return (
    <meshPhysicalMaterial
      color={isFresh ? "#000000" : color}
      emissive={color}
      emissiveIntensity={isFresh ? 0.5 : isFatigued ? 3.5 : 2.5}
      roughness={0.2}
      metalness={0.9}
      transmission={isFresh ? 0.4 : 0.2}
      thickness={0.5}
      transparent={true}
      opacity={isFresh ? 0.25 : isFatigued ? 0.8 : 0.6}
      clearcoat={1}
      side={THREE.DoubleSide}
      toneMapped={false}
    />
  );
}

function HumanAnatomy({ status }: { status: BodyStatus }) {
  const gltf = useGLTF("/models/human_parts.glb");
  const nodes = gltf.nodes as Record<string, THREE.Mesh>;

  const upperBodyParts = ["Chest", "Shoulders", "Biceps", "Triceps", "Forearms", "Upper_back", "Middle_back"];
  const coreParts = ["Core", "Lower_back"];
  const lowerBodyParts = ["Quads", "Hamstrings", "Glutes", "Calves"];
  const headParts = ["General"];

  const RenderPart = ({ name, bodyStatus }: { name: string, bodyStatus: MuscleStatus }) => {
    if (!nodes[name]) return null;
    return (
      <mesh geometry={nodes[name].geometry}>
        <HologramMaterial status={bodyStatus} />
      </mesh>
    );
  };

  return (
    <group position={[0, -0.9, 0]} scale={1.0}>
      {upperBodyParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.upperBody} />
      ))}

      {coreParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.core} />
      ))}

      {lowerBodyParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.lowerBody} />
      ))}

      {headParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus="fresh" />
      ))}
    </group>
  );
}

export function HolographicBody3D({ aiMessage }: HolographicBody3DProps) {
  const bodyStatus = useBodyStore((state) => state.bodyStatus);
  
  // Default message when no workout data is available
  const displayMessage = aiMessage || "System nominal. All muscle groups fresh.";

  return (
    <GlassCard className="h-full flex flex-col relative overflow-hidden" padding="none">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Activity className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Bio-Scan</span>
      </div>

      <div className="flex-1 w-full h-full min-h-[500px]" style={{ touchAction: "none" }}>
        <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} gl={{ alpha: true }}>
          <Suspense fallback={<Html center><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></Html>}>
            <Environment preset="city" />

            <ambientLight intensity={1} />
            <spotLight position={[10, 10, 10]} intensity={5} color="#10b981" />
            <spotLight position={[-10, 5, -10]} intensity={5} color="#3b82f6" />
            <pointLight position={[0, 2, -2]} intensity={2} color="white" />

            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
              <HumanAnatomy status={bodyStatus} />
            </Float>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-sm font-mono-ai text-zinc-300 typing-effect">
          <span className="text-emerald-400 mr-2">{">"}</span>
          {displayMessage}
        </p>
      </div>
    </GlassCard>
  );
}

useGLTF.preload("/models/human_parts.glb");
