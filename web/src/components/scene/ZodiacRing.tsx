"use client";

import React, { useState } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { ZODIAC_SIGNS } from "@/lib/astrology";
import { SCENE_CONFIG } from "@/lib/config";
import { ObjectLabel } from "./ObjectLabel";

export function ZodiacRing() {
    const [hovered, setHovered] = useState(false);
    const radius = SCENE_CONFIG.zodiacRadius;

    // Empirical correction note:
    // In Ephemeris: X=Aries, Y=North.
    // Standard RingGeometry lies in XY plane.
    // To align it with the Ecliptic (XZ plane), we rotate -90 deg on X.
    // rotation={[-Math.PI / 2, 0, 0]}

    // Angle 0 in Ring is +X.
    // Angle 90 is +Y (which becomes -Z after rotation).
    // This matches standard math (CCW from Top).

    return (
        <group>
            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* Ecliptic Plane Ring */}
                <mesh
                    onPointerOver={(event) => {
                        event.stopPropagation();
                        setHovered(true);
                    }}
                    onPointerOut={(event) => {
                        event.stopPropagation();
                        setHovered(false);
                    }}
                >
                    <ringGeometry args={[radius - 0.2, radius + 0.2, 128]} />
                    <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
                </mesh>
                {/* Signs */}
                {ZODIAC_SIGNS.map((sign, i) => {
                    const angle = (i * 30 + 15) * (Math.PI / 180); // Center of sign
                    const x = radius * Math.cos(angle);
                    const z = -radius * Math.sin(angle); // Match standard CCW from Top

                    return (
                        <Text
                            key={sign}
                            position={[x, 0, z]}
                            rotation={[-Math.PI / 2, 0, angle + Math.PI / 2]} // Lay flat, face center
                            fontSize={1.2}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {sign}
                        </Text>
                    );
                })}
            </group>
            <ObjectLabel name="Zodiac Ring" visible={hovered} offset={[0, 2.5, 0]} />
        </group>
    );
}
