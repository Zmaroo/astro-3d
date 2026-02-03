import * as THREE from "three";
import { toJulianDay, degToRad, normalizeDegrees } from "./time";

export type PlanetName = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";

// Orbital elements (approximate, J2000)
// N = longitude of the ascending node
// i = inclination to the ecliptic (plane of the Earth's orbit)
// w = argument of perihelion
// a = semi-major axis, or mean distance from the Sun
// e = eccentricity (0=circle, 0-1=ellipse, 1=parabola)
// M = mean anomaly
//
// Elements from: https://ssd.jpl.nasa.gov/planets/approx_pos.html or similar simplified models
// We use a simplified model for visual accuracy.

interface OrbitalElements {
    N: number;
    i: number;
    w: number;
    a: number;
    e: number;
    M: number;
}

// Rates per day
const CY = 36525; // days per century

function getElements(name: PlanetName, d: number): OrbitalElements {
    // d is days since J2000.0

    if (name === "Mercury") {
        return {
            N: 48.33167 + 3.24587e-5 * d,
            i: 7.00487 + 5.00e-8 * d,
            w: 29.1241 + 1.01444e-5 * d,
            a: 0.387098,
            e: 0.205630 + 2.527e-8 * d,
            M: normalizeDegrees(168.6562 + 4.0923344368 * d)
        };
    }
    if (name === "Venus") {
        return {
            N: 76.68069 + 2.46590e-5 * d,
            i: 3.39471 + 2.75e-8 * d,
            w: 54.8910 + 1.38374e-5 * d,
            a: 0.723332,
            e: 0.006773 - 1.302e-9 * d,
            M: normalizeDegrees(48.0052 + 1.6021302244 * d)
        };
    }
    if (name === "Mars") {
        return {
            N: 49.5574 + 2.11081e-5 * d,
            i: 1.8497 - 1.78e-8 * d,
            w: 286.5016 + 2.92961e-5 * d,
            a: 1.523688,
            e: 0.093405 + 2.516e-9 * d,
            M: normalizeDegrees(18.6021 + 0.5240207766 * d)
        };
    }
    if (name === "Jupiter") {
        return {
            N: 100.4542 + 2.76854e-5 * d,
            i: 1.3030 - 1.557e-7 * d,
            w: 273.8777 + 1.64505e-5 * d,
            a: 5.20256,
            e: 0.048498 + 4.469e-9 * d,
            M: normalizeDegrees(19.8950 + 0.0830853001 * d)
        };
    }
    if (name === "Saturn") {
        return {
            N: 113.6634 + 2.38980e-5 * d,
            i: 2.4886 - 1.081e-7 * d,
            w: 339.3939 + 2.97661e-5 * d,
            a: 9.55475,
            e: 0.055546 - 9.499e-9 * d,
            M: normalizeDegrees(316.9670 + 0.0334442282 * d)
        };
    }
    // Default fallback
    return { N: 0, i: 0, w: 0, a: 0, e: 0, M: 0 };
}

// Simple Moon position (low precision but visual)
function getMoonPosition(d: number): THREE.Vector3 {
    const L = normalizeDegrees(218.316 + 13.176396 * d); // Mean longitude
    const M = normalizeDegrees(134.963 + 13.064993 * d); // Mean anomaly
    const F = normalizeDegrees(93.272 + 13.229350 * d);  // Argument of latitude

    // Ecliptic coordinates
    const l = L + 6.289 * Math.sin(degToRad(M));
    const b = 5.128 * Math.sin(degToRad(F));
    const r = 0.00257 * (1 - 0.0549 * Math.cos(degToRad(M))); // Distance in AU approx (384k km)

    // Convert to Cartesian (Ecliptic)
    // x towards Vernal Equinox
    const x = r * Math.cos(degToRad(b)) * Math.cos(degToRad(l));
    const y = r * Math.cos(degToRad(b)) * Math.sin(degToRad(l));
    const z = r * Math.sin(degToRad(b));

    // For visualization: Three.js Y-up usually?
    // Let's assume Scene uses Y-up for North (Ecliptic Pole), X/Z for plane.
    return new THREE.Vector3(x, z, -y); // Swapping to match typical Y-up scene if needed, BUT:
    // Actually, let's stick to a standard:
    // X = 0 deg Aries
    // Z = 90 deg Cancer (or -90). 
    // Y = Ecliptic North.
    // Standard Math: x = r cos theta, y = r sin theta.
    // In ThreeJS default, Y is up. X is right. Z is forward/back.
    // Let's map: ecliptic x -> THREE x, ecliptic y -> THREE -z, ecliptic z -> THREE y.

    return new THREE.Vector3(x, z, -y);
}

function solveKepler(M: number, e: number): number {
    let E = M; // Initial guess (in radians usually, but here inputs are degrees, so watch out)
    const Mrad = degToRad(M);
    let E_curr = Mrad;

    for (let i = 0; i < 10; i++) {
        const dE = (E_curr - e * Math.sin(E_curr) - Mrad) / (1 - e * Math.cos(E_curr));
        E_curr -= dE;
        if (Math.abs(dE) < 1e-6) break;
    }

    return E_curr; // Radians
}

function getHeliocentricPosition(name: PlanetName, d: number): THREE.Vector3 {
    if (name === "Sun") return new THREE.Vector3(0, 0, 0);
    if (name === "Moon") return new THREE.Vector3(0, 0, 0); // Processed separately

    const el = getElements(name, d);
    const E = solveKepler(el.M, el.e);

    // Heliocentric coords in orbital plane
    const x_orb = el.a * (Math.cos(E) - el.e);
    const y_orb = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);

    // Rotate to ecliptic
    const i_rad = degToRad(el.i);
    const N_rad = degToRad(el.N);
    const w_rad = degToRad(el.w);

    const cw = Math.cos(w_rad);
    const sw = Math.sin(w_rad);
    const cN = Math.cos(N_rad);
    const sN = Math.sin(N_rad);
    const ci = Math.cos(i_rad);
    const si = Math.sin(i_rad);

    // 3D rotation matrix application
    // x_ecl = x_orb * (cw*cN - sw*sN*ci) + y_orb * (-sw*cN - cw*sN*ci)
    // y_ecl = x_orb * (cw*sN + sw*cN*ci) + y_orb * (-sw*sN + cw*cN*ci)
    // z_ecl = x_orb * (sw*si)            + y_orb * (cw*si)

    const x_ecl = x_orb * (cw * cN - sw * sN * ci) + y_orb * (-sw * cN - cw * sN * ci);
    const y_ecl = x_orb * (cw * sN + sw * cN * ci) + y_orb * (-sw * sN + cw * cN * ci);
    const z_ecl = x_orb * (sw * si) + y_orb * (cw * si);

    // Map to simple coordinate system (X=Aries, Y=North, Z=-90deg)
    // Standard OpenGL/ThreeJS: Y is Up. 
    // Let's use Y = Ecliptic North (z_ecl).
    // X = 0 deg (x_ecl).
    // Z = - y_ecl (to make right-handed system with Y up?)
    // Actually, x=0deg, y=90deg is standard 2D.
    // In 3D: X=Right, Y=Up, Z=Back.
    // Let's map: 
    // Ecliptic X -> Three X
    // Ecliptic Y -> Three -Z (so +Y is "up" on the 2D plane, which maps to -Z depth)
    // Ecliptic Z -> Three Y (Up)

    return new THREE.Vector3(x_ecl, z_ecl, -y_ecl);
}

function getEarthHeliocentric(d: number): THREE.Vector3 {
    // Earth elements
    const N = 0; // Reference plane
    const i = 0; // Reference plane
    const w = 102.9404 + 4.70935e-5 * d;
    const a = 1.000000;
    const e = 0.016709 - 1.151e-9 * d;
    const M = normalizeDegrees(356.0470 + 0.9856002585 * d);

    const E = solveKepler(M, e);
    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // w is longitude of perihelion, which includes N. Since N=0, w = arg of perihelion + N.
    // So we just rotate by w.
    const w_rad = degToRad(w);

    const x_ecl = x_orb * Math.cos(w_rad) - y_orb * Math.sin(w_rad);
    const y_ecl = x_orb * Math.sin(w_rad) + y_orb * Math.cos(w_rad);
    const z_ecl = 0;

    return new THREE.Vector3(x_ecl, z_ecl, -y_ecl);
}

export function getPlanetEci(date: Date, name: PlanetName): THREE.Vector3 {
    const jd = toJulianDay(date);
    const d = jd - 2451545.0;

    if (name === "Moon") {
        return getMoonPosition(d);
    }

    const earthPos = getEarthHeliocentric(d);

    if (name === "Sun") {
        return new THREE.Vector3(-earthPos.x, -earthPos.y, -earthPos.z);
    }

    const planetPos = getHeliocentricPosition(name, d);
    return planetPos.sub(earthPos);
}

export function getAllPlanetsEci(date: Date): Record<PlanetName, THREE.Vector3> {
    const names: PlanetName[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
    const result = {} as Record<PlanetName, THREE.Vector3>;

    for (const name of names) {
        result[name] = getPlanetEci(date, name);
    }

    return result;
}
