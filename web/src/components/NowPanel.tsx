"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useTime } from "./timeContext";
import { computeChart, ChartResult } from "@/lib/astrology";
import { getSignInterpretation, getAspectInterpretation } from "@/lib/interpretation";

export default function NowPanel() {
    const { simDate } = useTime();
    const [chart, setChart] = useState<ChartResult | null>(null);

    // Default location (London for generic "Universal" feel, or 0,0)
    const lat = 51.5;
    const lon = 0.0;

    const lastUpdate = React.useRef(0);
    useEffect(() => {
        // Throttle chart computation to ~1 second to save CPU
        const now = Date.now();
        if (now - lastUpdate.current > 1000) {
            const res = computeChart({ date: simDate, lat, lon });
            setChart(res);
            lastUpdate.current = now;
        }
    }, [simDate]);

    if (!chart) return null;

    const sunData = chart.planets.find(p => p.name === "Sun");
    const moonData = chart.planets.find(p => p.name === "Moon");
    // Ascendant is in chart.ascendant (degree). Need to convert to sign.
    const ascSignName = chart.houses[0].sign; // Housing 1 is ASC sign? Yes our logic sets house 1 cusp.
    // Wait, chart.houses[0] is House 1. Its sign is the sign of the cusp.
    // House data: { number, degree, sign }

    const topAspects = chart.aspects.slice(0, 5);

    return (
        <div className="fixed top-4 left-4 w-80 max-h-[90vh] overflow-y-auto bg-black/40 backdrop-blur-md text-white rounded-xl border border-white/10 p-4 shadow-2xl z-40 scrollbar-hide">
            <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                Cosmic Waiter
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
                {simDate.toLocaleString()}
            </p>

            {/* Big 3 */}
            <div className="space-y-3 mb-6">
                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-orange-300 font-bold">Sun</span>
                        <span className="text-sm font-light">{sunData?.sign}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-snug">
                        {sunData && getSignInterpretation(sunData.sign)}
                    </p>
                </div>

                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-300 font-bold">Moon</span>
                        <span className="text-sm font-light">{moonData?.sign}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-snug">
                        {moonData && getSignInterpretation(moonData.sign)}
                    </p>
                </div>

                <div className="bg-white/5 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-purple-300 font-bold">Rising</span>
                        <span className="text-sm font-light">{ascSignName}</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-snug">
                        {ascSignName && getSignInterpretation(ascSignName)}
                    </p>
                </div>
            </div>

            {/* Planets Table */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Planetary Positions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs mb-6">
                {chart.planets.map((p) => (
                    <div key={p.name} className="flex justify-between border-b border-white/5 py-1">
                        <span className="text-neutral-300">{p.name}</span>
                        <span className="font-mono text-neutral-400">{p.sign} {Math.floor(p.signDegree)}°</span>
                    </div>
                ))}
            </div>

            {/* Aspects */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Current Vibes</h3>
            <div className="space-y-2">
                {topAspects.map((a, i) => (
                    <div key={i} className="text-xs bg-black/20 p-2 rounded border border-white/5">
                        <div className="font-bold text-pink-200 mb-0.5">
                            {a.planet1} {a.type} {a.planet2}
                        </div>
                        <div className="text-neutral-400 italic">
                            ...suggests {getAspectInterpretation(a.type)}
                        </div>
                    </div>
                ))}
                {topAspects.length === 0 && <div className="text-xs text-neutral-500">No major aspects right now.</div>}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <a href="/chart" className="inline-block px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-neutral-200 transition-colors">
                    Create Birth Chart →
                </a>
            </div>
        </div>
    );
}
