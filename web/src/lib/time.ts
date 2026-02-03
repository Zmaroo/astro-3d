export function nowUtc(): Date {
    return new Date();
}

export function toJulianDay(date: Date): number {
    return (date.getTime() / 86400000) + 2440587.5;
}

export function fromJulianDay(jd: number): Date {
    return new Date((jd - 2440587.5) * 86400000);
}

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function degToRad(deg: number): number {
    return deg * DEG2RAD;
}

export function radToDeg(rad: number): number {
    return rad * RAD2DEG;
}

export function normalizeDegrees(d: number): number {
    let res = d % 360;
    if (res < 0) res += 360;
    return res;
}

export function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

/**
 * Returns the Greenwich Sidereal Time (in degrees) for a given Julian Day.
 */
export function getGST(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    let gst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000.0);
    return normalizeDegrees(gst);
}

/**
 * Returns the Local Sidereal Time (in degrees).
 * lon is longitude in degrees (positive East).
 */
export function getLST(jd: number, lon: number): number {
    return normalizeDegrees(getGST(jd) + lon);
}
