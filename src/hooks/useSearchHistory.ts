// useSearchHistory.ts — saved searches persisted to localStorage

import { useState, useEffect, useCallback } from "react";
import type { HistoryItem, IPData } from "../types";

const KEY = "iptracker-history";
const MAX = 50;

function useSearchHistory() {
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(KEY) || "[]");
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(KEY, JSON.stringify(history));
    }, [history]);

    const add = useCallback((d: IPData) => {
        setHistory((prev) => {
            if (prev[0]?.ip === d.ip) return prev;
            const item: HistoryItem = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                ip: d.ip,
                city: d.location.city || "",
                region: d.location.region || "",
                lat: d.location.lat,
                lng: d.location.lng,
                timestamp: Date.now(),
            };
            return [item, ...prev].slice(0, MAX);
        });
    }, []);

    const remove = useCallback((id: string) => {
        setHistory((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const clear = useCallback(() => setHistory([]), []);

    return { history, add, remove, clear };
}

export default useSearchHistory;