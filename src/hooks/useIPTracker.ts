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