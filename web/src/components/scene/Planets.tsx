"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { SCENE_CONFIG } from "@/lib/config";
import { PlanetName, getPlanetEci } from "@/lib/ephemeris";
import { ObjectLabel } from "./ObjectLabel";
import { PlanetOrbit } from "./PlanetOrbit";

// Helper util (duplicated)
function getVisualPosition(eci: THREE.Vector3): THREE.Vector3 {
    const distAu = eci.length();
    if (distAu < 0.01) return eci.multiplyScalar(200);
    const visualDist = 18 * Math.sqrt(distAu);
    return eci.clone().normalize().multiplyScalar(visualDist);
}

export function Planets({ simDate, sunLightRef }: { simDate: Date, sunLightRef: React.RefObject<THREE.DirectionalLight | null> }) {
    const [hoveredName, setHoveredName] = useState<string | null>(null);

    // Load Textures
    const textures = useTexture([
        "/textures/mercury/mercury-albedo.jpg",
        "/textures/venus/venus-atmosphere.jpg",
        "/textures/mars/mars-albedo.jpg",
        "/textures/jupiter/jupiter-albedo.jpg",
        "/textures/saturn/saturn-albedo.jpg",
        "/textures/uranus/uranus-albedo.jpg",
        "/textures/neptune/neptune-albedo.jpg",
        "/textures/saturn/saturn-ring.png",
        "/textures/sun/sun-albedo.jpg",
    ]);

    // Planet Data
    const planetMeshes = useMemo(() => [
        { name: "Mercury", config: SCENE_CONFIG.planets.Mercury, tex: textures[0] },
        { name: "Venus", config: SCENE_CONFIG.planets.Venus, tex: textures[1] },
        { name: "Mars", config: SCENE_CONFIG.planets.Mars, tex: textures[2] },
        { name: "Jupiter", config: SCENE_CONFIG.planets.Jupiter, tex: textures[3] },
        { name: "Saturn", config: SCENE_CONFIG.planets.Saturn, tex: textures[4], ringTex: textures[7] },
        { name: "Uranus", config: SCENE_CONFIG.planets.Uranus, tex: textures[5] },
        { name: "Neptune", config: SCENE_CONFIG.planets.Neptune, tex: textures[6] },
    ] as const, [textures]);

    // Refs for updating positions
    const groupRef = useRef<THREE.Group>(null!);

    useFrame(() => {
        if (!groupRef.current) return;

        // Update Sun Position
        const sunEci = getPlanetEci(simDate, "Sun");
        const sunPos = getVisualPosition(sunEci);

        // Light follows Sun
        if (sunLightRef.current) {
            sunLightRef.current.position.copy(sunPos);
        }

        const sunGroup = groupRef.current.getObjectByName("Sun");
        if (sunGroup) sunGroup.position.copy(sunPos);

        // Planets
        planetMeshes.forEach((p) => {
            const group = groupRef.current.getObjectByName(p.name);
            if (group) {
                const eci = getPlanetEci(simDate, p.name as PlanetName);
                group.position.copy(getVisualPosition(eci));
            }
        });
    });

    return (
        <group ref={groupRef}>
            {/* SUN */}
            <group
                name="Sun"
                onPointerOver={(event) => {
                    event.stopPropagation();
                    setHoveredName("Sun");
                }}
                onPointerOut={(event) => {
                    event.stopPropagation();
                    setHoveredName(null);
                }}
            >
                <mesh>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshBasicMaterial map={textures[8]} />
                </mesh>
                <ObjectLabel name="Sun" visible={hoveredName === "Sun"} offset={[0, 2, 0]} />
            </group>

            {planetMeshes.map((p) => (
                <group
                    key={p.name}
                    name={p.name}
                    onPointerOver={(event) => {
                        event.stopPropagation();
                        setHoveredName(p.name);
                    }}
                    onPointerOut={(event) => {
                        event.stopPropagation();
                        setHoveredName(null);
                    }}
                >
                    <mesh scale={p.config.scale}>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial map={p.tex} roughness={0.7} />
                        {p.name === "Saturn" && (
                            <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                                <ringGeometry args={[1.4, 2.2, 64]} />
                                <meshStandardMaterial
                                    map={p.ringTex}
                                    side={THREE.DoubleSide}
                                    transparent
                                    opacity={0.8}
                                />
                            </mesh>
                        )}
                    </mesh>
                    <ObjectLabel name={p.name} visible={hoveredName === p.name} />
                </group>
            ))}

            <PlanetOrbit name="Mercury" simDate={simDate} />
            <PlanetOrbit name="Venus" simDate={simDate} />
            <PlanetOrbit name="Mars" simDate={simDate} />
            <PlanetOrbit name="Jupiter" simDate={simDate} />
            <PlanetOrbit name="Saturn" simDate={simDate} />
            <PlanetOrbit name="Uranus" simDate={simDate} />
            <PlanetOrbit name="Neptune" simDate={simDate} />
        </group>
    );
}
