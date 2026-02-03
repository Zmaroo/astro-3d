"use client";

import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { toJulianDay, getGST, degToRad } from "@/lib/time";
import { SCENE_CONFIG } from "@/lib/config";
import { ObjectLabel } from "./ObjectLabel";

type SunDirUniform = THREE.IUniform<THREE.Vector3>;
type UniformMap = Record<string, THREE.IUniform>;
type R3FShader = {
    uniforms: UniformMap;
    fragmentShader: string;
};

export function Earth({ sunLight, simDate }: { sunLight: React.RefObject<THREE.DirectionalLight | null>, simDate: Date }) {
    const [hovered, setHovered] = useState(false);
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

    useFrame(({ camera }, delta) => {
        // Earth rotation linked to Sidereal Time
        const jd = toJulianDay(simDate);
        const gst = getGST(jd);

        const rotationOffset = SCENE_CONFIG.earth.rotationOffset;
        const angle = degToRad(gst) + rotationOffset;

        if (earthRef.current) earthRef.current.rotation.y = angle;
        if (cloudRef.current) cloudRef.current.rotation.y = angle * SCENE_CONFIG.earth.cloudsSpeed;

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

    const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(true);
    };

    const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setHovered(false);
    };

    return (
        <group>
            <mesh ref={earthRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
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
            <mesh ref={cloudRef} scale={1.01} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshStandardMaterial map={clouds} transparent opacity={0.28} depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh scale={1.04} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
                <sphereGeometry args={[1, 128, 128]} />
                <meshBasicMaterial color="#4da3ff" transparent opacity={0.07} side={THREE.BackSide} />
            </mesh>
            <ObjectLabel name="Earth" visible={hovered} offset={[0, 1.4, 0]} />
        </group>
    );
}
