// useTheme.ts — three-axis theme: mode, inversion %, night mode %
// Persisted to localStorage, reduced-motion handled at CSS level

import { useState, useEffect, useCallback } from "react";
import type { ThemeState } from "../types";

const KEY = "iptracker-theme";
const DEFAULT: ThemeState = { mode: "light", inversion: 0, blueLight: 0 };

function useTheme() {
    const [theme, setTheme] = useState<ThemeState>(() => {
        try {
            const saved = localStorage.getItem(KEY);
            return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
        } catch {
            return DEFAULT;
        }
    });

    useEffect(() => {
        localStorage.setItem(KEY, JSON.stringify(theme));
    }, [theme]);

    const toggleMode = useCallback(() => {
        setTheme((t) => ({ ...t, mode: t.mode === "light" ? "dark" : "light" }));
    }, []);

    const setInversion = useCallback((v: number) => {
        setTheme((t) => ({ ...t, inversion: Math.min(100, Math.max(0, v)) }));
    }, []);

    const setBlueLight = useCallback((v: number) => {
        setTheme((t) => ({ ...t, blueLight: Math.min(100, Math.max(0, v)) }));
    }, []);

    return { theme, toggleMode, setInversion, setBlueLight };
}

export default useTheme;