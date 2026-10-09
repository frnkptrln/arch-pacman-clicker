/* Save contracts and elapsed-time accounting. Works offline and in Node tests. */
(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.ClickerPersistence = api;
})(typeof globalThis === "object" ? globalThis : this, function () {
    "use strict";
    const MAX_OFFLINE_SECONDS = 8 * 60 * 60;
    const MAX_BALANCE = 1e100;

    function number(value, name, fallback = 0, maximum = MAX_BALANCE, integer = false) {
        if (value === undefined) return fallback;
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 ||
            value > maximum || (integer && !Number.isSafeInteger(value))) {
            throw new Error(`Ungültiger Spielstand: ${name}`);
        }
        return value;
    }

    function normalizeSave(data, groups) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new Error("Der Spielstand muss ein JSON-Objekt sein.");
        }
        if (data.version !== undefined && data.version !== 3) {
            throw new Error("Diese Spielstand-Version wird nicht unterstützt.");
        }
        // An unrelated JSON object must never wipe a game through import.
        if (!("packages" in data) || !("automationUpgrades" in data)) {
            throw new Error("Die Datei ist kein Arch-Package-Clicker-Spielstand.");
        }
        const result = {
            version: 3,
            packages: number(data.packages, "Pakete"),
            totalPackages: number(data.totalPackages, "Run-Pakete"),
            aurReputation: number(data.aurReputation, "Reputation", 0, Number.MAX_SAFE_INTEGER, true),
            archCredits: number(data.archCredits, "Arch Credits", 0, Number.MAX_SAFE_INTEGER, true),
            savedAt: data.savedAt === undefined ? null : number(data.savedAt, "Zeitpunkt", 0, 8.64e15, true)
        };
        if (result.totalPackages < result.packages) {
            throw new Error("Run-Pakete dürfen nicht kleiner als verfügbare Pakete sein.");
        }
        for (const [key, definitions] of Object.entries(groups)) {
            const saved = data[key] === undefined ? [] : data[key];
            if (!Array.isArray(saved)) throw new Error(`Ungültige Upgrade-Liste: ${key}`);
            const byName = new Map();
            for (const entry of saved) {
                if (!entry || typeof entry.name !== "string" || byName.has(entry.name)) {
                    throw new Error(`Ungültiges oder doppeltes Upgrade: ${key}`);
                }
                if (!definitions.some(def => def.name === entry.name)) {
                    throw new Error(`Unbekanntes Upgrade: ${entry.name}`);
                }
                byName.set(entry.name, entry);
            }
            result[key] = definitions.map(def => ({
                name: def.name,
                count: number(byName.get(def.name)?.count, def.name, 0, def.maxCount || 1000, true)
            }));
        }
        return result;
    }

    function elapsedSeconds(previous, now) {
        if (!Number.isFinite(previous) || !Number.isFinite(now) || previous < 0 || now <= previous) return 0;
        return Math.min(MAX_OFFLINE_SECONDS, (now - previous) / 1000);
    }

    return { normalizeSave, elapsedSeconds, MAX_OFFLINE_SECONDS, MAX_BALANCE };
});
