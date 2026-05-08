// useIPTracker.ts — Geo.ipify fetch with error state and AbortController support
// API key from .env via import.meta.env (never hardcoded)
//
// Note: no `loading` state. Callers wrap fetch calls in React 19's
// useTransition; isPending alone tracks busy state and avoids the flicker
// that would happen if an aborted request's finally block ran before the
// next fetch began.

import { useState, useCallback } from "react";
import type { IPData } from "../types";

const URL = "https://geo.ipify.org/api/v2/country,city";

const isIPv4 = (v: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(v);
const isIPv6 = (v: string) => v.includes(":") && /^[0-9a-fA-F:]+$/.test(v);
const isDomain = (v: string) => /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(v);

export function validateQuery(q: string): string | null {
    if (!q) return null;
    if (isIPv4(q) || isIPv6(q) || isDomain(q)) return null;
    return "Please enter a valid IP address or domain.";
}

function buildUrl(q: string) {
    const params = new URLSearchParams({ apiKey: import.meta.env.VITE_GEO_API_KEY });
    const v = q.trim();
    if (v) params.set(isIPv4(v) || isIPv6(v) ? "ipAddress" : "domain", v);
    return `${URL}?${params.toString()}`;
}

function useIPTracker() {
    const [data, setData] = useState<IPData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchIP = useCallback(async (query: string, signal?: AbortSignal) => {
        setError(null);
        try {
            const res = await fetch(buildUrl(query), { signal });
            if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
            const result: IPData = await res.json();
            setData(result);
            return result;
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return null;
            setError(err instanceof Error ? err.message : "Unknown error");
            return null;
        }
    }, []);

    return { data, error, fetchIP, setData };
}

export default useIPTracker;