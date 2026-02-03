export const INTERPRETATIONS = {
    signs: {
        Aries: "Aries is the pioneer, bold and energetic.",
        Taurus: "Taurus is reliable, grounded, and loves comfort.",
        Gemini: "Gemini is curious, adaptable, and communicative.",
        Cancer: "Cancer is nurturing, intuitive, and protective.",
        Leo: "Leo is charismatic, creative, and loves the spotlight.",
        Virgo: "Virgo is practical, analytical, and detail-oriented.",
        Libra: "Libra seeks balance, harmony, and partnership.",
        Scorpio: "Scorpio is intense, passionate, and transformative.",
        Sagittarius: "Sagittarius is adventurous, optimistic, and seeks truth.",
        Capricorn: "Capricorn is ambitious, disciplined, and strategic.",
        Aquarius: "Aquarius is innovative, independent, and humanitarian.",
        Pisces: "Pisces is compassionate, artistic, and sensitive."
    },
    planets: {
        Sun: "Vitality, ego, and core identity.",
        Moon: "Emotions, instincts, and inner needs.",
        Mercury: "Communication, intellect, and reasoning.",
        Venus: "Love, beauty, and values.",
        Mars: "Action, desire, and aggression.",
        Jupiter: "Growth, abundance, and higher learning.",
        Saturn: "Structure, limitation, and responsibility."
    },
    aspects: {
        Conjunction: "merged energies, intensifying both planets.",
        Opposition: "a need for balance between opposing forces.",
        Square: "tension and challenge that drives action.",
        Trine: "harmonious flow and natural talent.",
        Sextile: "opportunity and supportive connection."
    }
};

export function getSignInterpretation(sign: string) {
    return INTERPRETATIONS.signs[sign as keyof typeof INTERPRETATIONS.signs] || "";
}

export function getPlanetInterpretation(planet: string) {
    return INTERPRETATIONS.planets[planet as keyof typeof INTERPRETATIONS.planets] || "";
}

export function getAspectInterpretation(type: string) {
    return INTERPRETATIONS.aspects[type as keyof typeof INTERPRETATIONS.aspects] || "";
}
