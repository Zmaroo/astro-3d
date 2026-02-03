"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { PlanetName, getPlanetEci } from "@/lib/ephemeris";

// This helper is duplicated from Scene.tsx (will be moved to a util soon)
function getVisualPosition(eci: THREE.Vector3): THREE.Vector3 {
    const distAu = eci.length();
    if (distAu < 0.01) return eci.multiplyScalar(200); // Moon or close
    const visualDist = 18 * Math.sqrt(distAu);
    return eci.clone().normalize().multiplyScalar(visualDist);
}

export function PlanetOrbit({ name }: { name: PlanetName }) {
    const points = useMemo(() => {
        // Generate orbit path for J2000 roughly
        const pts: THREE.Vector3[] = [];
        const start = new Date("2000-01-01").getTime();
        // Period of planet?
        // Mercury 88 days, Saturn 29 years.
        // We'll just draw a representative orbit.
        const periodDays = name === "Mercury" ? 88 : name === "Saturn" ? 10759 : 365;
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const t = start + (i / steps) * periodDays * 86400000;
            const pos = getPlanetEci(new Date(t), name);
            pts.push(getVisualPosition(pos));
        }
        return pts;
    }, [name]);

    return <Line points={points} color="white" opacity={0.1} transparent lineWidth={1} />;
}
