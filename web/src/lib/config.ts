export const SCENE_CONFIG = {
    // Planet Visual Properties
    planets: {
        Mercury: { scale: 0.4, color: "#A5A5A5" },
        Venus: { scale: 0.9, color: "#E3BB76" },
        Mars: { scale: 0.5, color: "#DD4D22" },
        Jupiter: { scale: 2.5, color: "#D6A566" },
        Saturn: { scale: 2.2, color: "#F4D03F" },
        Uranus: { scale: 1.8, color: "#4FD0E7" },
        Neptune: { scale: 1.8, color: "#7093DB" },
    },
    // Earth Rotation
    earth: {
        rotationOffset: 0, // Empirical correction to align textures with ECI frame
        cloudsSpeed: 1.002, // Relative to Earth rotation
    },
    // Background
    starField: {
        radius: 400, // Background sphere radius
        rotation: [Math.PI / 3, 0, Math.PI / 2] as [number, number, number], // 60 deg tilt for Galactic Plane approx
    },
    // Layout
    zodiacRadius: 60,
};
