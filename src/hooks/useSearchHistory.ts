/ useSearchHistory.ts — saved searches persisted to localStorage

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
