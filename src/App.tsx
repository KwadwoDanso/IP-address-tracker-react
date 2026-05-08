// App.tsx — root with multi-page routing and global theme overlays
//
// Theme model:
//   theme.mode is a number 0-100. We write it as a CSS variable --mode
//   on the document root. Every color token in index.html is computed via
//   color-mix() weighted by --mode, so dragging the slider produces a
//   smooth, continuous gradient transition between light and dark.

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
  const { theme, setMode, setInversion, setBlueLight } = useTheme();
  const { history, add, remove, clear } = useSearchHistory();

  // Push --mode to documentElement so every CSS color-mix() picks it up
  useEffect(() => {
    document.documentElement.style.setProperty("--mode", `${theme.mode}%`);
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
            onSetMode={setMode}
            onInversion={setInversion}
            onBlueLight={setBlueLight}
            onNavigate={handleNavigate}
          />
        )}
        {page === "tracker" && (
          <TrackerPage
            theme={theme}
            onSetMode={setMode}
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

      {/* Night overlay sits OUTSIDE the inverted shell so the warm amber tint
          stays warm even when inversion is also on. */}
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