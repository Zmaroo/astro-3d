"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChartFormPage() {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [lat, setLat] = useState("51.5");
    const [lon, setLon] = useState("0.0");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Encode params
        const params = new URLSearchParams({
            date,
            lat,
            lon
        });
        router.push(`/chart/result?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl border border-white/10 shadow-2xl">
                <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    Create Birth Chart
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-neutral-400">Birth Date & Time</label>
                        <input
                            type="datetime-local"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-black border border-neutral-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-neutral-400">Latitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                required
                                value={lat}
                                onChange={(e) => setLat(e.target.value)}
                                className="w-full bg-black border border-neutral-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-neutral-400">Longitude</label>
                            <input
                                type="number"
                                step="0.0001"
                                required
                                value={lon}
                                onChange={(e) => setLon(e.target.value)}
                                className="w-full bg-black border border-neutral-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {loading ? "Calculating..." : "Generate Chart"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-sm text-neutral-500 hover:text-white transition-colors">← Back to Cosmos</a>
                </div>
            </div>
        </div>
    );
}
