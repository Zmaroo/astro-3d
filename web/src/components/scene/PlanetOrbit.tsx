"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { PlanetName, getPlanetEci } from "@/lib/ephemeris";
import { ObjectLabel } from "./ObjectLabel";

// This helper is duplicated from Scene.tsx (will be moved to a util soon)
function getVisualPosition(eci: THREE.Vector3): THREE.Vector3 {
    const distAu = eci.length();
    if (distAu < 0.01) return eci.multiplyScalar(200); // Moon or close
    const visualDist = 18 * Math.sqrt(distAu);
    return eci.clone().normalize().multiplyScalar(visualDist);
}

const ORBIT_PERIOD_DAYS: Record<PlanetName, number> = {
    Sun: 0,
    Moon: 27.3,
    Mercury: 88,
    Venus: 225,
    Mars: 687,
    Jupiter: 4333,
    Saturn: 10759,
    Uranus: 30687,
    Neptune: 60190,
};

export function PlanetOrbit({ name, simDate }: { name: PlanetName; simDate: Date }) {
    const [hovered, setHovered] = useState(false);

    const orbitEpochKey = simDate.getUTCFullYear() * 12 + simDate.getUTCMonth();

    const { points, labelPosition } = useMemo(() => {
        // Generate orbit path for current epoch
        const pts: THREE.Vector3[] = [];
        const periodDays = ORBIT_PERIOD_DAYS[name] || 365;
        const start = simDate.getTime() - (periodDays * 86400000) / 2;
        const maxSteps = 360;
        const minSteps = 120;
        const steps = Math.min(maxSteps, Math.max(minSteps, Math.round(periodDays / 20)));
        for (let i = 0; i <= steps; i++) {
            const t = start + (i / steps) * periodDays * 86400000;
            const pos = getPlanetEci(new Date(t), name);
            pts.push(getVisualPosition(pos));
        }
        const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.15);
        const smoothCount = Math.min(720, Math.max(240, steps * 4));
        const smoothPoints = curve.getPoints(smoothCount);
        const labelIndex = Math.floor(smoothPoints.length / 2);
        const labelPosition = smoothPoints[labelIndex] ? smoothPoints[labelIndex].clone() : new THREE.Vector3();
        return { points: smoothPoints, labelPosition };
    }, [name, orbitEpochKey]);

    return (
        <group>
            <Line
                points={points}
                color="white"
                opacity={0.1}
                transparent
                lineWidth={1}
                onPointerOver={(event) => {
                    event.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(event) => {
                    event.stopPropagation();
                    setHovered(false);
                }}
            />
            <group position={labelPosition}>
                <ObjectLabel name={name} visible={hovered} offset={[0, 0.6, 0]} />
            </group>
        </group>
    );
}
