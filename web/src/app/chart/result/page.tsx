"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { computeChart, ChartResult } from "@/lib/astrology";
import { getSignInterpretation, getPlanetInterpretation, getAspectInterpretation } from "@/lib/interpretation";

function ChartResultContent() {
    const params = useSearchParams();
    const dateStr = params.get("date");
    const latStr = params.get("lat");
    const lonStr = params.get("lon");

    const [chart, setChart] = useState<ChartResult | null>(null);

    useEffect(() => {
        if (dateStr && latStr && lonStr) {
            const d = new Date(dateStr);
            const res = computeChart({
                date: d,
                lat: parseFloat(latStr),
                lon: parseFloat(lonStr)
            });
            setChart(res);
        }
    }, [dateStr, latStr, lonStr]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("URL copied to clipboard!");
    };

    if (!chart || !dateStr) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    // Interpretations
    const sun = chart.planets.find(p => p.name === "Sun");
    const moon = chart.planets.find(p => p.name === "Moon");
    const risingSign = chart.houses.find(h => h.number === 1)?.sign;

    // Interpret Rising
    const risingInterp = risingSign ? getSignInterpretation(risingSign) : "";

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex justify-between items-end border-b border-white/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                            Your Astral Blueprint
                        </h1>
                        <p className="text-neutral-400 mt-2">
                            {new Date(dateStr).toLocaleString()}
                        </p>
                    </div>
                    <div className="space-x-4">
                        <button onClick={handleShare} className="text-sm font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300">
                            Share
                        </button>
                        <Link href="/" className="text-sm font-bold uppercase tracking-wider text-neutral-400 hover:text-white">
                            Close
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Main Insights */}
                    <section className="space-y-8">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Core Identity</h2>

                            <div className="mb-6">
                                <span className="text-2xl font-bold text-orange-400 block mb-1">Sun in {sun?.sign}</span>
                                <p className="text-neutral-300 leading-relaxed">
                                    {sun?.sign && getSignInterpretation(sun.sign)} {getPlanetInterpretation("Sun")}
                                </p>
                            </div>

                            <div className="mb-6">
                                <span className="text-2xl font-bold text-blue-400 block mb-1">Moon in {moon?.sign}</span>
                                <p className="text-neutral-300 leading-relaxed">
                                    {moon?.sign && getSignInterpretation(moon.sign)} {getPlanetInterpretation("Moon")}
                                </p>
                            </div>

                            <div>
                                <span className="text-2xl font-bold text-purple-400 block mb-1">Rising {risingSign}</span>
                                <p className="text-neutral-300 leading-relaxed">
                                    {risingInterp}
                                </p>
                            </div>
                        </div>

                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Aspects</h2>
                            <div className="space-y-3">
                                {chart.aspects.map((a, i) => (
                                    <div key={i} className="flex flex-col border-b border-white/5 last:border-0 pb-2 mb-2">
                                        <span className="font-bold text-pink-200">{a.planet1} {a.type} {a.planet2}</span>
                                        <span className="text-xs text-neutral-400">{getAspectInterpretation(a.type)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Tables */}
                    <section className="space-y-8">
                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Placements</h2>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-neutral-500 border-b border-white/10">
                                        <th className="pb-2">Planet</th>
                                        <th className="pb-2">Sign</th>
                                        <th className="pb-2 text-right">Deg</th>
                                        <th className="pb-2 text-right">House</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {chart.planets.map(p => (
                                        <tr key={p.name}>
                                            <td className="py-2 text-neutral-300 font-medium">{p.name}</td>
                                            <td className="py-2 text-neutral-400">{p.sign}</td>
                                            <td className="py-2 text-neutral-500 text-right font-mono">{Math.floor(p.signDegree)}°</td>
                                            <td className="py-2 text-neutral-500 text-right">{p.house}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Houses (Placidus)</h2>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-neutral-500 border-b border-white/10">
                                        <th className="pb-2">House</th>
                                        <th className="pb-2">Sign</th>
                                        <th className="pb-2 text-right">Degree</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {chart.houses.map(h => (
                                        <tr key={h.number}>
                                            <td className="py-2 text-neutral-300 font-medium">{h.number}</td>
                                            <td className="py-2 text-neutral-400">{h.sign}</td>
                                            <td className="py-2 text-neutral-500 text-right font-mono">{h.degree.toFixed(2)}°</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default function ChartResultPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>}>
            <ChartResultContent />
        </Suspense>
    );
}
