// LandingPage.tsx — minimalist welcome hero
//
// Research-backed CRO principles: single primary CTA, generous whitespace,
// strong visual focal point (the topographic background), restrained motion.
// GSAP animates only transform + opacity (composited) and respects
// prefers-reduced-motion.

import { useEffect, useRef } from "react";
import type { ThemeState, Page } from "../types";
import TopographicBg from "./TopographicBg";
import ThemeControls from "./ThemeControls";

declare const gsap: any;

interface Props {
    theme: ThemeState;
    onToggleMode: () => void;
    onInversion: (v: number) => void;
    onBlueLight: (v: number) => void;
    onNavigate: (p: Page) => void;
}

function LandingPage({ theme, onToggleMode, onInversion, onBlueLight, onNavigate }: Props) {
    const heroRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof gsap === "undefined" || !heroRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const tween = gsap.from(heroRef.current.children, {
            y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out",
        });
        return () => tween.kill();
    }, []);

    return (
        <main id="main-content" className="landing" role="main" aria-label="Welcome">
            <TopographicBg isDark={theme.mode === "dark"} />

            <div className="landing__corner">
                <ThemeControls theme={theme} onToggleMode={onToggleMode} onInversion={onInversion} onBlueLight={onBlueLight} />
            </div>

            <div ref={heroRef} className="landing__hero">
                <h1 className="landing__h1">Welcome.</h1>
                <p className="landing__sub">
                    Locate any IP address on an interactive 3D-enhanced map.
                    See city, timezone, ISP. Save searches. Trace your path.
                </p>
                <div className="landing__ctas">
                    <button className="btn btn--primary" onClick={() => onNavigate("tracker")} aria-label="Open the IP tracker">
                        Get Started
                    </button>
                    <button className="btn btn--neu" onClick={() => onNavigate("about")} aria-label="Learn more about the app">
                        Learn More
                    </button>
                </div>
            </div>
        </main>
    );
}

export default LandingPage;