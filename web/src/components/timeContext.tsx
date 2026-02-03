"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface TimeContextType {
    simDate: Date;
    setSimDate: (d: Date) => void;
    speed: number;
    setSpeed: (s: number) => void;
    isPaused: boolean;
    setIsPaused: (p: boolean) => void;
}

const TimeContext = createContext<TimeContextType | null>(null);

export function TimeProvider({ children }: { children: React.ReactNode }) {
    const [simDate, setSimDateState] = useState(new Date());
    const [speed, setSpeed] = useState(1); // 1 sec real = 1 sec sim
    const [isPaused, setIsPaused] = useState(false);

    const lastTimeRef = useRef<number>(Date.now());
    const rafRef = useRef<number | undefined>(undefined);
    const simTimeRef = useRef<number>(Date.now());
    const lastStateUpdateRef = useRef<number>(Date.now());

    // Custom setter to keep ref in sync when manually changed
    const setSimDate = (d: Date) => {
        setSimDateState(d);
        simTimeRef.current = d.getTime();
    };

    useEffect(() => {
        // Initialize ref
        simTimeRef.current = simDate.getTime();
        // We only want to track changes to simDate that come from OUTSIDE the loop?
        // But if we put simDate in deps, loop restarts.
        // If we don't, manually setting date (e.g. Scrubber) might be overwritten by the loop if loop uses old ref?
        // No, setSimDate updates ref.
        // But initial mount simDate is used.
    }, []); // Run once on mount

    useEffect(() => {
        const loop = () => {
            const now = Date.now();
            const dt = (now - lastTimeRef.current) / 1000; // seconds
            lastTimeRef.current = now;

            if (!isPaused && speed !== 0) {
                // Advance simulation time in ref (high precision)
                simTimeRef.current += dt * speed * 1000;

                // Sync to React State at limited FPS (e.g. 30fps)
                if (now - lastStateUpdateRef.current > 33) {
                    setSimDateState(new Date(simTimeRef.current));
                    lastStateUpdateRef.current = now;
                }
            } else {
                // If paused, just keep lastTimeRef updated so we don't jump on resume
                // (Done above by lastTimeRef.current = now)
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        lastTimeRef.current = Date.now();
        lastStateUpdateRef.current = Date.now();
        rafRef.current = requestAnimationFrame(loop);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPaused, speed]);

    return (
        <TimeContext.Provider value={{ simDate, setSimDate, speed, setSpeed, isPaused, setIsPaused }}>
            {children}
        </TimeContext.Provider>
    );
}

export function useTime() {
    const ctx = useContext(TimeContext);
    if (!ctx) throw new Error("useTime must be used within TimeProvider");
    return ctx;
}
