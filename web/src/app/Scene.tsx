"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Text, Line } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useMemo, useRef, useEffect, useState } from "react";
import { useTime } from "@/components/timeContext";
import { PlanetName, getAllPlanetsEci, getPlanetEci } from "@/lib/ephemeris";
import { ZODIAC_SIGNS } from "@/lib/astrology";

type SunDirUniform = THREE.IUniform<THREE.Vector3>;
type UniformMap = Record<string, THREE.IUniform>;
type R3FShader = {
    uniforms: UniformMap;
    fragmentShader: string;
};

// Visual scaling factor
// Earth radius = 1
// We compress distances: VisualDist = Base + Scale * sqrt(ActualDistAU)
// Sun is at ~20 units.
function getVisualPosition(eci: THREE.Vector3): THREE.Vector3 {
    const distAu = eci.length();
    if (distAu < 0.01) return eci.multiplyScalar(200); // Moon or close
    const visualDist = 18 * Math.sqrt(distAu);
    return eci.clone().normalize().multiplyScalar(visualDist);
}

function ZodiacRing() {
    const radius = 60;
    return (
        <group rotation={[Math.PI / 2, 0, 0]}>
            {/* Ecliptic Plane Ring */}
            <mesh>
                <ringGeometry args={[radius - 0.2, radius + 0.2, 128]} />
                <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
            </mesh>
            {/* Signs */}
            {ZODIAC_SIGNS.map((sign, i) => {
                const angle = (i * 30 + 15) * (Math.PI / 180); // Center of sign
                // In Ecliptic coords: X=Aries(0). 
                // We mapped Ecliptic X -> Three X. Ecliptic Y (North) -> Three Y. Ecliptic Z -> Three -Z?
                // Wait, in Ephemeris: X=0(Aries), Z=-90. Y=North.
                // My ZodiacRing is rotated X by 90deg?
                // If I rotate usage of ring, I need to match Ephemeris.
                // Ephemeris: X=Aries. Y=North.
                // If I put ring in X-Z plane (ThreeJS default for ring?), then Y is up (North).
                // That matches Ephemeris Y=North.
                // So I should NOT rotate the ring group if RingGeometry is in XY plane?
                // RingGeometry is in XY plane by default.
                // So I need to rotate it -90 deg on X to make it X-Z plane?
                // Yes, rotation={[-Math.PI/2, 0, 0]} puts it in X-Z.

                // Then angle 0 (Aries) is +X.
                // angle 90 is -Z? (Clockwise or Counter?)
                // Standard Math: +X -> +Y.
                // After rotation: +X -> -Z.
                // So angle 0 is X. Angle 90 is -Z.
                // Ephemeris: X=Aries. Z=-90 (Cancer?).
                // Let's stick to standard math on the plane.

                const x = radius * Math.cos(angle);
                const z = -radius * Math.sin(angle); // Match standard CCW from Top?

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
    );
}

function PlanetOrbit({ name }: { name: PlanetName }) {
    const points = useMemo(() => {
        // Generate orbit path for J2000 roughly
        // We just sample 1 year worth of points?
        // Or just ellipse drawing?
        // Sampling ephemeris is accurate.
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

function Planets({ simDate, sunLightRef }: { simDate: Date, sunLightRef: React.RefObject<THREE.DirectionalLight | null> }) {
    // Planet Data
    const planetMeshes = useMemo(() => [
        { name: "Mercury", color: "#A5A5A5", scale: 0.4 },
        { name: "Venus", color: "#E3BB76", scale: 0.9 },
        { name: "Mars", color: "#DD4D22", scale: 0.5 },
        { name: "Jupiter", color: "#D6A566", scale: 2.5 },
        { name: "Saturn", color: "#F4D03F", scale: 2.2 },
    ] as const, []);

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

        // Sun Mesh (child 0 usually, or by name)
        const sunMesh = groupRef.current.getObjectByName("Sun");
        if (sunMesh) sunMesh.position.copy(sunPos);

        // Planets
        planetMeshes.forEach(p => {
            const mesh = groupRef.current.getObjectByName(p.name);
            if (mesh) {
                const eci = getPlanetEci(simDate, p.name as PlanetName);
                mesh.position.copy(getVisualPosition(eci));
            }
        });
    });

    return (
        <group ref={groupRef}>
            {/* SUN */}
            <mesh name="Sun">
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#FFD700" />
            </mesh>

            {planetMeshes.map(p => (
                <mesh key={p.name} name={p.name} scale={p.scale}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color={p.color} roughness={0.7} />
                    {p.name === "Saturn" && (
                        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
                            <ringGeometry args={[1.4, 2.2, 64]} />
                            <meshStandardMaterial color="#C5A46C" side={THREE.DoubleSide} transparent opacity={0.8} />
                        </mesh>
                    )}
                </mesh>
            ))}

            <PlanetOrbit name="Mercury" />
            <PlanetOrbit name="Venus" />
            <PlanetOrbit name="Mars" />
            <PlanetOrbit name="Jupiter" />
            <PlanetOrbit name="Saturn" />
        </group>
    );
}

function Earth({ sunLight }: { sunLight: React.RefObject<THREE.DirectionalLight | null> }) {
    const earthRef = useRef<THREE.Mesh>(null!);
    const cloudRef = useRef<THREE.Mesh>(null!);
    const shaderRef = useRef<R3FShader | null>(null);

    // Scratch objects
    const tmpVec = useMemo(() => new THREE.Vector3(), []);
    const tmpMat3 = useMemo(() => new THREE.Matrix3(), []);
    const tmpVec3 = useMemo(() => new THREE.Vector3(), []);

    const [day, night, normal, spec, clouds] = useTexture(
        [
            "/textures/earth/earth_day.jpg",
            "/textures/earth/earth_night.jpg",
            "/textures/earth/earth_normal.png",
            "/textures/earth/earth_spec.jpg",
            "/textures/earth/earth_clouds.jpg",
        ],
        (textures) => {
            const t = textures as unknown as THREE.Texture[];
            t[0].colorSpace = THREE.SRGBColorSpace;
            t[1].colorSpace = THREE.SRGBColorSpace;
            t[0].needsUpdate = true;
            t[1].needsUpdate = true;
        }
    );

    useFrame(({ camera, clock }, delta) => {
        // Earth rotation: Real Earth rotates 360 in 24h.
        // We want visual rotation? 
        // Let's keep the slow rotation from before for visual appeal, or link to time?
        // Real-time rotation might be too slow to notice or too fast if sped up.
        // Let's keep the artistic rotation.
        earthRef.current.rotation.y += delta * 0.02;
        cloudRef.current.rotation.y += delta * 0.025;

        const shader = shaderRef.current;
        const light = sunLight.current;
        if (shader && light) {
            // Fix: Vector pointing TO the sun
            tmpVec.copy(light.position).normalize();

            tmpMat3.setFromMatrix4(camera.matrixWorldInverse);
            tmpVec3.copy(tmpVec).applyMatrix3(tmpMat3).normalize();

            const uniforms = shader.uniforms as UniformMap;
            const u = uniforms.uSunDirView as SunDirUniform | undefined;
            if (u) u.value.copy(tmpVec3);
        }
    });

    return (
        <group>
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial
                    map={day}
                    normalMap={normal}
                    metalnessMap={spec}
                    roughness={0.85}
                    metalness={0.15}
                    emissive={new THREE.Color(0xffffff)}
                    emissiveMap={night}
                    emissiveIntensity={3.5}
                    onBeforeCompile={(shader) => {
                        const uniforms = shader.uniforms as UniformMap;
                        uniforms.uSunDirView = { value: new THREE.Vector3(0, 0, 1) } as SunDirUniform;
                        shaderRef.current = shader as unknown as R3FShader;

                        shader.fragmentShader = shader.fragmentShader.replace(
                            "#include <common>",
                            "#include <common>\nuniform vec3 uSunDirView;"
                        );

                        shader.fragmentShader = shader.fragmentShader.replace(
                            "#include <emissivemap_fragment>",
                            `#include <emissivemap_fragment>\nfloat ndl = dot(normalize(normal), normalize(uSunDirView));\nfloat nightMask = 1.0 - smoothstep(-0.05, 0.15, ndl);\ntotalEmissiveRadiance *= nightMask;\n`
                        );
                    }}
                />
            </mesh>
            <mesh ref={cloudRef} scale={1.01}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial map={clouds} transparent opacity={0.28} depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh scale={1.04}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshBasicMaterial color="#4da3ff" transparent opacity={0.07} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

function Moon({ simDate }: { simDate: Date }) {
    const moonRef = useRef<THREE.Mesh>(null!);
    const [moonAlbedo] = useTexture(["/textures/moon/moon_albedo.jpg"], (t) => {
        (t as unknown as THREE.Texture[])[0].colorSpace = THREE.SRGBColorSpace;
    });

    useFrame(() => {
        // Use real calc for moon?
        // getPlanetEci returns Moon pos relative to Earth in AU.
        const pos = getPlanetEci(simDate, "Moon");
        // pos is in AU. Moon is ~0.00257 AU.
        // We want to scale it to be visible. Previous code used 2.6 radius.
        // 0.00257 * 1000 = 2.57.
        // So scale of 1000 works for Moon.
        const scale = 1000;
        moonRef.current.position.set(pos.x * scale, pos.y * scale, pos.z * scale);

        // Rotation?
        moonRef.current.rotation.y += 0.001;
    });

    return (
        <mesh ref={moonRef} castShadow receiveShadow>
            <sphereGeometry args={[0.27, 64, 64]} />
            <meshStandardMaterial map={moonAlbedo} bumpMap={moonAlbedo} bumpScale={0.03} roughness={0.95} metalness={0} />
        </mesh>
    );
}

function SceneContent({ simDate }: { simDate: Date }) {
    const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

    return (
        <>
            <color attach="background" args={["#000"]} />
            <Stars radius={300} depth={100} count={8000} factor={4} fade />

            <ambientLight intensity={0.05} />
            <directionalLight ref={sunLightRef} position={[20, 0, 0]} intensity={2.8} />

            <Earth sunLight={sunLightRef} />
            <Moon simDate={simDate} />
            <Planets simDate={simDate} sunLightRef={sunLightRef} />
            <ZodiacRing />

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