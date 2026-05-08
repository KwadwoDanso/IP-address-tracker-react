// useTheme.ts — three-axis theme: mode (0-100 smooth), inversion %, night mode %
// mode = 0  → fully light
// mode = 100 → fully dark
// Intermediate values produce a smooth gradient blend via CSS color-mix()
// Persisted to localStorage; reduced-motion handled at CSS level

import { useState, useEffect, useCallback } from "react";
import type { ThemeState } from "../types";

const KEY = "iptracker-theme";
const DEFAULT: ThemeState = { mode: 0, inversion: 0, blueLight: 0 };

function clamp(v: number) {
    return Math.min(100, Math.max(0, v));
}

function useTheme() {
    const [theme, setTheme] = useState<ThemeState>(() => {
        try {
            const saved = localStorage.getItem(KEY);
            if (!saved) return DEFAULT;
            const parsed = JSON.parse(saved);
            // Migrate legacy "light"/"dark" string mode → 0/100 number
            const modeNum = typeof parsed.mode === "string"
                ? (parsed.mode === "dark" ? 100 : 0)
                : Number(parsed.mode) || 0;
            return { ...DEFAULT, ...parsed, mode: clamp(modeNum) };
        } catch {
            return DEFAULT;
        }
    });

    useEffect(() => {
        localStorage.setItem(KEY, JSON.stringify(theme));
    }, [theme]);

    const setMode = useCallback((v: number) => {
        setTheme((t) => ({ ...t, mode: clamp(v) }));
    }, []);

    const setInversion = useCallback((v: number) => {
        setTheme((t) => ({ ...t, inversion: clamp(v) }));
    }, []);

    const setBlueLight = useCallback((v: number) => {
        setTheme((t) => ({ ...t, blueLight: clamp(v) }));
    }, []);

    return { theme, setMode, setInversion, setBlueLight };
}

export default useTheme;