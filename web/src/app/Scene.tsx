"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRef, useState } from "react";
import { useTime } from "@/components/timeContext";
import { getPlanetEci } from "@/lib/ephemeris";

// Components
import { Earth } from "@/components/scene/Earth";
import { LunarNodes } from "@/components/scene/LunarNodes";
import { ObjectLabel } from "@/components/scene/ObjectLabel";
import { Planets } from "@/components/scene/Planets";
import { ZodiacRing } from "@/components/scene/ZodiacRing";
import { StarField } from "@/components/scene/StarField";

function Moon({ simDate }: { simDate: Date }) {
    // Moon is small enough to keep here or extract if needed.
    // For now, let's keep it here or extract? 
    // Let's implement it here properly first, or usage of getVisualPosition logic might be needed.
    // getVisualPosition was duplicated in Planets. Can we use a util?
    // Let's rewrite Moon simply.
    // Wait, Planets and Earth have logic. Moon logic is simple.
    // Let's keep Moon here for now to avoid over-engineering, 
    // or better, create Moon.tsx since we are refactoring.

    // Actually, I'll put Moon in Scene.tsx for now to save 1 file creation, 
    // but better to be consistent. 
    // Let's assume I'll just keep it here as it's simple.

    const moonRef = useRef<THREE.Mesh>(null!);
    // Texture loading for just moon?
    // We can use standard useTexture or just color for simplified moon if texture unused?
    // The original code passed texture.

    // Re-implementing simplified moon:
    return (
        <mesh ref={moonRef} castShadow receiveShadow>
            <sphereGeometry args={[0.27, 64, 64]} />
            <meshStandardMaterial color="#888" roughness={0.9} />
        </mesh>
    );
}

// Rewriting Moon properly with texture and position update
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

function MoonWithLogic({ simDate }: { simDate: Date }) {
    const [hovered, setHovered] = useState(false);
    const moonRef = useRef<THREE.Mesh>(null!);
    const [moonAlbedo] = useTexture(["/textures/moon/moon_albedo.jpg"], (t) => {
        (t as unknown as THREE.Texture[])[0].colorSpace = THREE.SRGBColorSpace;
    });

    useFrame(() => {
        const pos = getPlanetEci(simDate, "Moon");
        // Scale logic duplicated from original Scene.tsx
        // Moon is at ~0.00257 AU. Scale * 1000 = 2.57 units.
        const scale = 1000;
        if (moonRef.current) {
            moonRef.current.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
            moonRef.current.rotation.y += 0.001;
        }
    });

    return (
        <mesh
            ref={moonRef}
            castShadow
            receiveShadow
            onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={(event) => {
                event.stopPropagation();
                setHovered(false);
            }}
        >
            <sphereGeometry args={[0.27, 64, 64]} />
            <meshStandardMaterial map={moonAlbedo} bumpMap={moonAlbedo} bumpScale={0.03} roughness={0.95} />
            <ObjectLabel name="Moon" visible={hovered} offset={[0, 0.6, 0]} />
        </mesh>
    );
}

function SceneContent({ simDate }: { simDate: Date }) {
    const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

    return (
        <>
            <color attach="background" args={["#000"]} />
            {/* Stars replaced by Milky Way StarField */}
            <StarField />

            <ambientLight intensity={0.05} />
            <directionalLight ref={sunLightRef} position={[20, 0, 0]} intensity={2.8} />

            <Earth sunLight={sunLightRef} simDate={simDate} />
            <MoonWithLogic simDate={simDate} />
            <Planets simDate={simDate} sunLightRef={sunLightRef} />
            <ZodiacRing />
            <LunarNodes simDate={simDate} />

            <EffectComposer>
                <Bloom intensity={0.22} luminanceThreshold={0.75} luminanceSmoothing={0.15} />
            </EffectComposer>
            <OrbitControls enableDamping />
        </>
    );
}

export default function Scene() {
    const { simDate } = useTime();

    return (
        <div className="fixed inset-0">
            <Canvas
                shadows
                camera={{ position: [0, 6, 12], fov: 45 }}
                onCreated={({ gl }) => {
                    gl.outputColorSpace = THREE.SRGBColorSpace;
                    gl.toneMapping = THREE.ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.15;
                }}
            >
                <SceneContent simDate={simDate} />
            </Canvas>
        </div>
    );
}
