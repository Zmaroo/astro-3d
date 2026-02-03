"use client";

import React from "react";
import { useTime } from "./timeContext";

export default function TimeControls() {
    const { simDate, setSimDate, speed, setSpeed, isPaused, setIsPaused } = useTime();

    const handleNow = () => {
        setSimDate(new Date());
        setSpeed(1);
        setIsPaused(false);
    };

    const formatTime = (d: Date) => {
        return d.toLocaleString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // Scrubber: Change time within the current day (or just shift relative)
    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Value 0-100 mapped to 0-24 hours of the current sim day?
        // Or just a relative shift?
        // Let's make it set the hour/minute of the current simDate.
        const val = parseFloat(e.target.value); // 0 to 24
        const d = new Date(simDate);
        const h = Math.floor(val);
        const m = Math.floor((val - h) * 60);
        d.setHours(h, m, 0, 0);
        setSimDate(d);
    };

    // Current hour float for scrubber default
    const currentHour = simDate.getHours() + simDate.getMinutes() / 60;

    // Hydration fix
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl flex flex-col md:flex-row items-center gap-4 border border-white/10 shadow-xl z-50">
            <div className="text-sm font-mono min-w-[220px] text-center md:text-left">
                {mounted ? formatTime(simDate) : <span className="opacity-0">Loading...</span>}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleNow}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold uppercase tracking-wider"
                >
                    Now
                </button>

                <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-xs font-bold uppercase tracking-wider min-w-[60px]"
                >
                    {isPaused ? "Play" : "Pause"}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 uppercase">Speed</span>
                {[1, 100, 10000, 100000].map((s) => (
                    <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${speed === s ? "bg-white text-black font-bold" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            }`}
                    >
                        {s < 1000 ? s + "x" : (s / 1000) + "k"}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 uppercase">Scrub</span>
                <input
                    type="range"
                    min="0"
                    max="23.99"
                    step="0.01"
                    value={currentHour}
                    onChange={handleScrub}
                    className="w-32 accent-blue-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
}
