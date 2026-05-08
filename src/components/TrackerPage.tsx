// TrackerPage.tsx — search + info cards + map + theme controls
//
// React 19 patterns:
//   • useTransition wraps the heavy state swap (cards + map fly) so typing stays urgent
//   • useOptimistic echoes the submitted query in a pending status line
//   • AbortController cancels any in-flight fetch when a new submit lands
//
// Stacking strategy (fixes info card hidden behind map):
//   • .tracker wrapper sets `isolation: isolate` so its children stack
//     within their own context.
//   • .hero is z-index:5, .map-section is z-index:1.
//   • .info-wrap is absolutely positioned inside .hero with z-index:10,
//     so it sits above the hero AND visibly above the map — info card
//     stays in front no matter what Leaflet's internal panes do.

import { useState, useEffect, useRef, useTransition, useOptimistic } from "react";
import type { FormEvent, ChangeEvent } from "react";
import type { ThemeState, HistoryItem, IPData } from "../types";
import useIPTracker, { validateQuery } from "../hooks/useIPTracker";
import useIPVisibility from "../hooks/useIPVisibility";
import MapView from "./MapView";
import ThemeControls from "./ThemeControls";

interface Props {
    theme: ThemeState;
    onSetMode: (v: number) => void;
    onInversion: (v: number) => void;
    onBlueLight: (v: number) => void;
    history: HistoryItem[];
    onAddHistory: (d: IPData) => void;
    initialData?: IPData | null;
}

function TrackerPage({ theme, onSetMode, onInversion, onBlueLight, history, onAddHistory, initialData }: Props) {
    const { data, error, fetchIP, setData } = useIPTracker();
    const { visible, toggle, maskIP } = useIPVisibility();
    const [showTrackPath, setShowTrackPath] = useState(true);
    const [input, setInput] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [optimisticQuery, setOptimisticQuery] = useOptimistic("", (_, next: string) => next);
    const ctrlRef = useRef<AbortController | null>(null);

    // Initial mount: revisit data wins, otherwise fetch the visitor's IP
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

    // Numeric mode > 50 means "more dark than light" — used by MapView for tile choice
    const isDark = theme.mode > 50;

    return (
        <div id="main-content" className="tracker">
            <header className="hero">
                <div className="hero__bar">
                    <button
                        className="pill"
                        onClick={() => setShowTrackPath((s) => !s)}
                        aria-pressed={showTrackPath}
                    >
                        Track · {showTrackPath ? "On" : "Off"}
                    </button>
                    <div style={{ width: "min(280px, 100%)" }}>
                        <ThemeControls theme={theme} onSetMode={onSetMode} onInversion={onInversion} onBlueLight={onBlueLight} />
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

            <section className="map-section" aria-label="Map">
                <MapView data={data} isDark={isDark} showTrackPath={showTrackPath} history={history} />
            </section>
        </div>
    );
}

export default TrackerPage;