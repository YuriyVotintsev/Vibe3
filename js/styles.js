// styles.js - Centralized theme and style constants

// Color palette
export const COLORS = {
    // Primary colors
    primary: 0x9b59b6,      // purple
    primaryHover: 0x8e44ad,

    secondary: 0x3498db,    // blue
    secondaryHover: 0x2980b9,

    success: 0x27ae60,      // green (affordable)
    successHover: 0x2ecc71,
    successBright: 0x55efc4,

    warning: 0xf39c12,      // orange/gold
    warningHover: 0xe67e22,

    danger: 0xe74c3c,       // red
    dangerHover: 0xc0392b,

    // Background colors
    bgDark: 0x1a1a2e,
    bgHeader: 0x16213e,
    bgPanel: 0x1e1e2e,
    bgButton: 0x2a2a3e,
    bgButtonHover: 0x3a3a4e,
    bgDisabled: 0x444444,
    bgDisabledDark: 0x222233,
    bgOverlay: 0x000000,

    // Border colors
    border: 0x333333,
    borderLight: 0x555555,

    // Generic colors
    white: 0xffffff,
    black: 0x000000,

    // Effect colors
    bombParticle: 0xff6600,

    // Rendering colors
    shadow: 0x000000,
    highlight: 0xffffff,
    selection: 0xffffff,

    // Bomb colors
    bombBody: 0x8b0000,
    bombHighlight: 0xff4444,
    bombCircle: 0x1a1a1a,
    bombShine: 0x444444,
    bombFuse: 0xffaa00,
    bombSparkOuter: 0xffff00,
    bombSparkInner: 0xff6600,

    // Text colors (hex strings for Phaser text)
    text: {
        white: '#ffffff',
        light: '#d0d0d0',
        muted: '#888888',
        dark: '#000000',
        gold: '#f1c40f',
        goldDark: '#cc9900',
        green: '#55efc4',
        purple: '#e056fd',

        // Enhancement colors
        bronze: '#cd7f32',
        silver: '#c0c0c0',
        goldGem: '#ffd700',
        crystal: '#88ffff',
        rainbow: '#ff88ff',
        prismatic: '#ffff88',
        celestial: '#aaddff'
    }
};

// Font sizes
export const FONT_SIZE = {
    xs: '10px',
    sm: '11px',
    md: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '22px',
    '3xl': '26px',
    '4xl': '28px',
    '5xl': '32px',
    '6xl': '34px'
};

// Font families
export const FONT_FAMILY = {
    default: 'Arial',
    bold: 'Arial Black'
};

// Border radius
export const RADIUS = {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    '2xl': 16
};

// Spacing/gaps
export const SPACING = {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 15,
    '2xl': 20,
    '3xl': 25
};

// Button presets
export const BUTTON_STYLE = {
    primary: {
        bg: COLORS.primary,
        bgHover: COLORS.primaryHover,
        text: COLORS.text.white
    },
    secondary: {
        bg: COLORS.secondary,
        bgHover: COLORS.secondaryHover,
        text: COLORS.text.white
    },
    success: {
        bg: COLORS.success,
        bgHover: COLORS.successHover,
        text: COLORS.text.white,
        border: COLORS.successBright
    },
    warning: {
        bg: COLORS.warning,
        bgHover: COLORS.warningHover,
        text: COLORS.text.white
    },
    danger: {
        bg: COLORS.danger,
        bgHover: COLORS.dangerHover,
        text: COLORS.text.white
    },
    disabled: {
        bg: COLORS.bgDisabled,
        bgHover: COLORS.bgDisabled,
        text: COLORS.text.muted
    },
    default: {
        bg: COLORS.bgButton,
        bgHover: COLORS.bgButtonHover,
        text: COLORS.text.white,
        border: COLORS.borderLight
    }
};

// Common text styles
export const TEXT_STYLE = {
    title: {
        fontSize: FONT_SIZE['5xl'],
        fontFamily: FONT_FAMILY.bold,
        color: COLORS.text.white
    },
    subtitle: {
        fontSize: FONT_SIZE['4xl'],
        fontFamily: FONT_FAMILY.bold,
        color: COLORS.text.white
    },
    heading: {
        fontSize: FONT_SIZE.xl,
        fontStyle: 'bold',
        color: COLORS.text.white
    },
    body: {
        fontSize: FONT_SIZE.base,
        color: COLORS.text.white
    },
    small: {
        fontSize: FONT_SIZE.md,
        color: COLORS.text.light
    },
    muted: {
        fontSize: FONT_SIZE.sm,
        color: COLORS.text.muted
    }
};

// Panel dimensions
export const PANEL = {
    padding: 15,
    margin: 20,
    headerHeight: 100
};

// Animation durations (ms)
export const DURATION = {
    fast: 100,
    normal: 200,
    slow: 300,
    message: 1000
};
