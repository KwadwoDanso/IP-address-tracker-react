// SavedSearches.tsx — list of saved IP searches: revisit, delete, clear

import type { HistoryItem, Page } from "../types";

interface Props {
    history: HistoryItem[];
    onRemove: (id: string) => void;
    onClear: () => void;
    onRevisit: (item: HistoryItem) => void;
    onNavigate: (p: Page) => void;
}

function SavedSearches({ history, onRemove, onClear, onRevisit, onNavigate }: Props) {
    return (
        <main id="main-content" className="page" role="main" aria-label="Saved searches">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="page-title">Saved Searches</h1>
                    <p className="page-subtitle">{history.length} saved {history.length === 1 ? "location" : "locations"}</p>
                </div>
                {history.length > 0 && (
                    <button className="btn btn--small btn--ghost-danger" onClick={onClear} aria-label="Clear all saved searches">
                        Clear All
                    </button>
                )}
            </header>

            {history.length === 0 ? (
                <div className="neu-card saved-empty">
                    <p style={{ fontSize: "1.05rem", color: "var(--ink-900)" }}>No saved searches yet</p>
                    <p style={{ fontSize: "0.85rem", color: "var(--ink-600)", margin: "0.5rem 0 1.25rem" }}>
                        Search for an IP address to see it here.
                    </p>
                    <button className="btn btn--primary" onClick={() => onNavigate("tracker")}>Open Tracker</button>
                </div>
            ) : (
                <ul className="saved-list">
                    {history.map((item) => (
                        <li key={item.id} className="saved-item">
                            <div className="saved-item__main">
                                <p className="saved-item__ip">{item.ip}</p>
                                <p className="saved-item__loc">
                                    {[item.city, item.region].filter(Boolean).join(", ") || "Unknown location"}
                                </p>
                                <p className="saved-item__time">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="btn--sm-primary" onClick={() => onRevisit(item)} aria-label={`Revisit ${item.ip} on map`}>
                                    View
                                </button>
                                <button className="btn btn--small btn--ghost-danger" onClick={() => onRemove(item.id)} aria-label={`Delete saved search for ${item.ip}`}>
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}

export default SavedSearches;