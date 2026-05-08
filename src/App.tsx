// App.tsx — root component with multi-page routing
//
// State lifting:
//   • Theme is set on documentElement via data-theme="dark" so CSS variables
//     flip in one place — no per-component theme prop drilling for styling.
//   • History is shared across Tracker (writes) and SavedSearches (reads).
//   • Inversion is applied as a single root-level CSS filter that cascades.
//   • Night mode overlay is a fixed div with pointer-events: none — never
//     blocks input.

import { useState, useEffect } from "react";
import type { Page, IPData, HistoryItem } from "./types";
import useTheme from "./hooks/useTheme";
import useSearchHistory from "./hooks/useSearchHistory";
import LandingPage from "./components/LandingPage";
import TrackerPage from "./components/TrackerPage";
import SavedSearches from "./components/SavedSearches";
import AboutPage from "./components/AboutPage";
import Sitemap from "./components/Sitemap";

function App() {
  const [page, setPage] = useState<Page>("landing");
  const [revisitData, setRevisitData] = useState<IPData | null>(null);
  const { theme, toggleMode, setInversion, setBlueLight } = useTheme();
  const { history, add, remove, clear } = useSearchHistory();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme.mode);
  }, [theme.mode]);

  const handleRevisit = (item: HistoryItem) => {
    setRevisitData({
      ip: item.ip,
      isp: "",
      location: { city: item.city, region: item.region, postalCode: "", timezone: "", lat: item.lat, lng: item.lng },
    });
    setPage("tracker");
  };

  const handleNavigate = (next: Page) => {
    setPage(next);
    if (next !== "tracker") setRevisitData(null);
  };

  const inversionStyle: React.CSSProperties = theme.inversion > 0
    ? { filter: `invert(${theme.inversion}%) hue-rotate(180deg)`, transition: "filter 0.3s ease" }
    : {};

  return (
    <>
      <div className="shell" style={inversionStyle}>
        {page === "landing" && (
          <LandingPage
            theme={theme}
            onToggleMode={toggleMode}
            onInversion={setInversion}
            onBlueLight={setBlueLight}
            onNavigate={handleNavigate}
          />
        )}
        {page === "tracker" && (
          <TrackerPage
            theme={theme}
            onToggleMode={toggleMode}
            onInversion={setInversion}
            onBlueLight={setBlueLight}
            history={history}
            onAddHistory={add}
            initialData={revisitData}
          />
        )}
        {page === "saved" && (
          <SavedSearches history={history} onRemove={remove} onClear={clear} onRevisit={handleRevisit} onNavigate={handleNavigate} />
        )}
        {page === "about" && <AboutPage />}

        <Sitemap current={page} onNavigate={handleNavigate} />
      </div>

      {/* Night overlay sits OUTSIDE the inverted shell so the warm amber
          tint stays warm even when inversion is also on. */}
      {theme.blueLight > 0 && (
        <div
          className="night-overlay"
          aria-hidden="true"
          style={{ backgroundColor: `rgba(255, 180, 50, ${theme.blueLight / 250})` }}
        />
      )}
    </>
  );
}

export default App;