// playerData.js - Player state management with EventEmitter

// ========== SIMPLE EVENT EMITTER ==========

const listeners = {};

export function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => off(event, callback); // Return unsubscribe function
}

export function off(event, callback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
}

function emit(event, data) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => cb(data));
}

// ========== DEFAULT VALUES ==========

// Balanced for ~2 hour full completion
const DEFAULTS = {
    // Currency
    currency: 0,
    totalEarned: 0,

    // Regular upgrades
    autoMoveDelay: 5000,
    bombChance: 10,
    bombRadius: 1,

    // Enhancement chances (improved starting values)
    bronzeChance: 8,    // was 5
    silverChance: 2,    // was 1
    goldChance: 0,
    crystalChance: 0,
    rainbowChance: 0,
    prismaticChance: 0,
    celestialChance: 0,

    // Prestige
    prestigeCurrency: 0,
    prestigeMoneyMult: 0,
    prestigeTiers: 0,
    prestigeColors: 0,
    prestigeArena: 0,

    // Auto-buy flags
    autoBuyAutoMove: false,
    autoBuyBombChance: false,
    autoBuyBombRadius: false,
    autoBuyBronze: false,
    autoBuySilver: false,
    autoBuyGold: false,
    autoBuyCrystal: false,
    autoBuyRainbow: false,
    autoBuyPrismatic: false,
    autoBuyCelestial: false
};

// Properties that reset on prestige
const PRESTIGE_RESET_KEYS = [
    'currency', 'totalEarned', 'autoMoveDelay', 'bombChance', 'bombRadius',
    'bronzeChance', 'silverChance', 'goldChance', 'crystalChance',
    'rainbowChance', 'prismaticChance', 'celestialChance'
];

// ========== REACTIVE PLAYER DATA ==========

// Internal data store
const _data = { ...DEFAULTS };

// Proxy with change notifications
export const PlayerData = new Proxy(_data, {
    set(target, prop, value) {
        const oldValue = target[prop];
        target[prop] = value;

        // Emit specific property change
        if (oldValue !== value) {
            emit(`change:${prop}`, { prop, oldValue, newValue: value });
            emit('change', { prop, oldValue, newValue: value });
        }

        return true;
    },
    get(target, prop) {
        return target[prop];
    }
});

// ========== PERSISTENCE ==========

export function savePlayerData() {
    try {
        localStorage.setItem('match3_player', JSON.stringify(_data));
    } catch (e) {
        console.warn('Failed to save player data:', e);
    }
}

export function loadPlayerData() {
    try {
        const saved = localStorage.getItem('match3_player');
        if (saved) {
            const data = JSON.parse(saved);
            // Use Object.assign on internal data to avoid triggering events
            Object.assign(_data, data);
        }
    } catch (e) {
        console.warn('Failed to load player data:', e);
    }

    ensureValidValues();
}

function ensureValidValues() {
    for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
        if (_data[key] === undefined || _data[key] === null) {
            _data[key] = defaultValue;
        }
    }

    // Validate ranges
    if (_data.autoMoveDelay < 100) {
        _data.autoMoveDelay = DEFAULTS.autoMoveDelay;
    }
    if (_data.currency < 0) {
        _data.currency = 0;
    }
}

// ========== RESET FUNCTIONS ==========

export function resetPlayerData() {
    for (const key of PRESTIGE_RESET_KEYS) {
        PlayerData[key] = DEFAULTS[key]; // Use proxy to emit events
    }
    savePlayerData();
    emit('reset', { type: 'soft' });
}

// ========== HELPERS ==========

export function getDefaultValue(key) {
    return DEFAULTS[key];
}

export function getPrestigeResetKeys() {
    return PRESTIGE_RESET_KEYS;
}
