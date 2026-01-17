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

// --- COLOR MAP ---
const getBodyPartColor = (status: MuscleStatus) => {
  switch (status) {
    case "fatigued": return new THREE.Color("#f59e0b").multiplyScalar(3); // Amber
    case "recovering": return new THREE.Color("#3b82f6").multiplyScalar(2); // Blue
    case "target": return new THREE.Color("#a855f7").multiplyScalar(3); // Purple
    default: return new THREE.Color("#10b981").multiplyScalar(0.2); // Dim Emerald
  }
};

// --- HOLOGRAPHIC MATERIAL ---
function HologramMaterial({ status }: { status: MuscleStatus }) {
  const color = useMemo(() => getBodyPartColor(status), [status]);
  
  return (
    <meshPhysicalMaterial
      color={status === 'fresh' ? "#000000" : color}
      emissive={color}
      emissiveIntensity={status === 'fresh' ? 0.3 : 2.0}
      roughness={0.2}
      metalness={0.9}
      transmission={0.4}
      thickness={0.5}
      transparent={true}
      opacity={status === 'fresh' ? 0.15 : 0.5}
      clearcoat={1}
      side={THREE.DoubleSide}
      toneMapped={false}
    />
  );
}

// --- THE ANATOMY MODEL ---
function HumanAnatomy({ status }: { status: BodyStatus }) {
  const gltf = useGLTF("/models/human_parts.glb");
  const nodes = gltf.nodes as Record<string, THREE.Mesh>;

  // Ovdje mapiramo tvoje Blender nazive na logiku aplikacije (Upper/Core/Lower)
  // Kasnije možeš dodati specifičnu logiku za svaki mišić ako želiš!
  
  const upperBodyParts = ["Chest", "Shoulders", "Biceps", "Triceps", "Forearms", "Upper_back", "Middle_back"];
  const coreParts = ["Core", "Lower_back"];
  const lowerBodyParts = ["Quads", "Hamstrings", "Glutes", "Calves"];
  const headParts = ["General"]; // Onaj tvoj preimenovani Object_2

  // Helper function to render a part if it exists in the GLB
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
      
      {/* UPPER BODY GROUP */}
      {upperBodyParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.upperBody} />
      ))}

      {/* CORE GROUP */}
      {coreParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.core} />
      ))}

      {/* LOWER BODY GROUP */}
      {lowerBodyParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus={status.lowerBody} />
      ))}

      {/* HEAD / GENERAL (Uvijek Fresh ili neutralan) */}
      {headParts.map((part) => (
        <RenderPart key={part} name={part} bodyStatus="fresh" />
      ))}

    </group>
  );
}

export function HolographicBody3D({ aiMessage }: HolographicBody3DProps) {
  const bodyStatus = useBodyStore((state) => state.bodyStatus);
  
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
            
            {/* Osvjetljenje */}
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
          {aiMessage}
        </p>
      </div>
    </GlassCard>
  );
}

useGLTF.preload("/models/human_parts.glb");