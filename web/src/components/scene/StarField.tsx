"use client";

import React from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { SCENE_CONFIG } from "@/lib/config";

export function StarField() {
    const radius = SCENE_CONFIG.starField.radius;
    const rotation = SCENE_CONFIG.starField.rotation;

    const texture = useTexture("/textures/stars_mw/stars-milkyway.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // Actually, for a simple BackSide sphere, standard UV mapping (Equirectangular mostly) works fine if we just map it.
    // 'EquirectangularReflectionMapping' is for environment maps. For MeshBasicMaterial, just default is fine if geometry is Sphere.

    return (
        <mesh rotation={rotation}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.BackSide}
                color="#ffffff"
            />
        </mesh>
    );
}
