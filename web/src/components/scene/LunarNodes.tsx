"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { getMeanLunarNodeLongitude } from "@/lib/astrology";
import { normalizeDegrees } from "@/lib/time";
import { SCENE_CONFIG } from "@/lib/config";
import { ObjectLabel } from "./ObjectLabel";

interface NodePosition {
    position: [number, number, number];
    label: string;
}

export function LunarNodes({ simDate }: { simDate: Date }) {
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
    const radius = SCENE_CONFIG.zodiacRadius - 0.6;

    const nodes = useMemo<NodePosition[]>(() => {
        const ascLon = getMeanLunarNodeLongitude(simDate);
        const descLon = normalizeDegrees(ascLon + 180);
        const ascAngle = (ascLon * Math.PI) / 180;
        const descAngle = (descLon * Math.PI) / 180;

        return [
            {
                label: "Asc Node",
                position: [radius * Math.cos(ascAngle), 0, -radius * Math.sin(ascAngle)],
            },
            {
                label: "Desc Node",
                position: [radius * Math.cos(descAngle), 0, -radius * Math.sin(descAngle)],
            },
        ];
    }, [simDate, radius]);

    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {nodes.map((node) => (
                <group key={node.label} position={node.position}>
                    <mesh
                        onPointerOver={(event) => {
                            event.stopPropagation();
                            setHoveredLabel(node.label);
                        }}
                        onPointerOut={(event) => {
                            event.stopPropagation();
                            setHoveredLabel(null);
                        }}
                    >
                        <sphereGeometry args={[0.12, 16, 16]} />
                        <meshBasicMaterial color="#d9d9d9" toneMapped={false} />
                    </mesh>
                    <ObjectLabel name={node.label} visible={hoveredLabel === node.label} offset={[0, 0.6, 0]} />
                </group>
            ))}
        </group>
    );
}
