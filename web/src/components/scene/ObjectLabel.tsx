"use client";

import React from "react";
import { Html } from "@react-three/drei";

interface ObjectLabelProps {
    name: string;
    visible: boolean;
    offset?: [number, number, number];
}

export function ObjectLabel({ name, visible, offset = [0, 1.5, 0] }: ObjectLabelProps) {
    if (!visible) return null;

    return (
        <Html position={offset} center transform={false}>
            <div className="px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/20 rounded text-white text-xs font-bold whitespace-nowrap shadow-lg select-none pointer-events-none">
                {name}
            </div>
        </Html>
    );
}
