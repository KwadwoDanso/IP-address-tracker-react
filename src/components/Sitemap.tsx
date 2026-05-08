// Sitemap.tsx — small navigation footer on every page

import type { Page } from "../types";

const PAGES: { id: Page; label: string }[] = [
    { id: "landing", label: "Home" },
    { id: "tracker", label: "Tracker" },
    { id: "saved", label: "Saved" },
    { id: "about", label: "About" },
];

interface Props {
    current: Page;
    onNavigate: (p: Page) => void;
}

function Sitemap({ current, onNavigate }: Props) {
    return (
        <nav className="sitemap" aria-label="Site navigation">
            <ul className="sitemap__list">
                {PAGES.map((p) => (
                    <li key={p.id}>
                        <button
                            className="sitemap__btn"
                            onClick={() => onNavigate(p.id)}
                            aria-current={current === p.id ? "page" : undefined}
                        >
                            {p.label}
                        </button>
                    </li>
                ))}
            </ul>
            <p className="sitemap__copy">
                © {new Date().getFullYear()} IP Address Tracker · Built by Kwadwo Danso
            </p>
        </nav>
    );
}

export default Sitemap;