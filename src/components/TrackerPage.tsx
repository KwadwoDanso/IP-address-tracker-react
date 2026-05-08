// TrackerPage.tsx — search + info cards + map + theme controls
//
// React 19 patterns (per research report):
//   • useTransition wraps the heavy state swap (cards + map fly) so typing stays urgent
//   • useOptimistic echoes the submitted query in a pending status line
//   • AbortController cancels any in-flight fetch when a new submit lands
//
// All visual styling comes from index.html utility classes; this file
// contains only structure, state, and event flow.

import { useState, useEffect, useRef, useTransition, useOptimistic } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type { ThemeState, HistoryItem, IPData } from "../types";
import useIPTracker, { validateQuery } from "../hooks/useIPTracker";
import useIPVisibility from "../hooks/useIPVisibility";
import MapView from "./MapView";
import ThemeControls from "./ThemeControls";

interface Props {
    theme: ThemeState;
    onToggleMode: () => void;
    onInversion: (v: number) => void;
    onBlueLight: (v: number) => void;
    history: HistoryItem[];
    onAddHistory: (d: IPData) => void;
    initialData?: IPData | null;
}

function TrackerPage({ theme, onToggleMode, onInversion, onBlueLight, history, onAddHistory, initialData }: Props) {
    const { data, error, fetchIP, setData } = useIPTracker();
    const { visible, toggle, maskIP } = useIPVisibility();
    const [showTrackPath, setShowTrackPath] = useState(true);
    const [input, setInput] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [optimisticQuery, setOptimisticQuery] = useOptimistic("", (_, next: string) => next);
    const ctrlRef = useRef<AbortController | null>(null);

    // Initial mount: revisit data wins, otherwise fetch the visitor's IP
    // (Wrapped in startTransition so isPending alone is sufficient for status —
    //  no flicker from useIPTracker's setLoading firing on aborted requests.)
    useEffect(() => {
        if (initialData) { setData(initialData); return; }
        startTransition(async () => {
            setOptimisticQuery("your public IP");
            const controller = new AbortController();
            ctrlRef.current = controller;
            const result = await fetchIP("", controller.signal);
            if (result) onAddHistory(result);
        });
        return () => ctrlRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = input.trim();
        const err = validateQuery(q);
        if (err) { setValidationError(err); return; }
        setValidationError(null);

        // Action body — useOptimistic + startTransition together
        startTransition(async () => {
            setOptimisticQuery(q || "your public IP");
            if (ctrlRef.current) ctrlRef.current.abort();
            const controller = new AbortController();
            ctrlRef.current = controller;
            const result = await fetchIP(q, controller.signal);
            if (result) onAddHistory(result);
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (validationError) setValidationError(null);
    };

    // isPending alone is sufficient — useIPTracker's loading would flicker on
    // aborted requests because finally blocks fire before the next fetch starts.
    const busy = isPending;
    const status = busy
        ? `Looking up ${optimisticQuery || "your public IP"}…`
        : validationError || error || (data ? `Showing ${maskIP(data.ip)}` : "");

    const cards = [
        { label: "IP Address", value: data ? maskIP(data.ip) : "—", toggle: true },
        { label: "Location", value: data ? [data.location.city, data.location.region, data.location.postalCode].filter(Boolean).join(", ") : "—" },
        { label: "Timezone", value: data?.location.timezone ? `UTC ${data.location.timezone}` : "—" },
        { label: "ISP", value: data?.isp || "—" },
    ];

    return (
        <div id="main-content" style={{ display: "flex", flexDirection: "column", flex: 1, animation: "fadeIn 0.3s ease" }}>
            <header className="hero">
                <div className="hero__bar">
                    <button
                        className="pill"
                        onClick={() => setShowTrackPath((s) => !s)}
                        aria-pressed={showTrackPath}
                    >
                        Track Path · {showTrackPath ? "On" : "Off"}
                    </button>
                    <div style={{ width: "min(280px, 100%)" }}>
                        <ThemeControls theme={theme} onToggleMode={onToggleMode} onInversion={onInversion} onBlueLight={onBlueLight} />
                    </div>
                </div>

                <h1 className="hero__title">IP Address Tracker</h1>

                <form className="search" role="search" aria-label="Search by IP or domain" onSubmit={handleSubmit}>
                    <label htmlFor="ip-q" className="sr-only">IP address or domain</label>
                    <div className="search__bar">
                        <input
                            id="ip-q"
                            className="search__input"
                            type="search"
                            value={input}
                            onChange={handleChange}
                            placeholder="Search for any IP address or domain"
                            autoComplete="off"
                            spellCheck={false}
                            aria-describedby="search-status"
                        />
                        <button type="submit" className="search__submit" aria-label="Search" disabled={busy}>
                            <img src="/images/icon-arrow.svg" alt="" width="11" height="14" />
                        </button>
                    </div>
                </form>

                <p
                    id="search-status"
                    aria-live="polite"
                    className={`hero__status${validationError || error ? " hero__status--error" : ""}`}
                >
                    {status}
                </p>

                <div className="info-wrap">
                    <dl className="info" aria-label="IP address details">
                        {cards.map((c) => (
                            <div key={c.label} className="info__cell">
                                <dt className="info__label">
                                    {c.label}
                                    {c.toggle && (
                                        <button className="info__toggle" onClick={toggle} aria-label={visible ? "Hide IP address" : "Show IP address"}>
                                            {visible ? "Hide" : "Show"}
                                        </button>
                                    )}
                                </dt>
                                <dd className="info__value">{c.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </header>

            <main className="map-section" aria-label="Map">
                <MapView data={data} isDark={theme.mode === "dark"} showTrackPath={showTrackPath} history={history} />
            </main>
        </div>
    );
}

export default TrackerPage;