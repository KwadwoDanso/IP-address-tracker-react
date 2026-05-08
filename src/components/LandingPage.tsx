// LandingPage.tsx — minimalist welcome hero with bold prominent content
//
// Visual hierarchy in front of the 3D background:
//   1. Eyebrow tag (small, brand color, uppercase) — orients the visitor
//   2. Welcome headline (huge display weight)
//   3. Bold lead sentence — what the page is about, in heavy weight
//   4. Lighter sub paragraph — supporting context
//   5. Two CTAs

import { useEffect, useRef } from "react";
import type { ThemeState, Page } from "../types";
import TopographicBg from "./TopographicBg";
import ThemeControls from "./ThemeControls";

declare const gsap: any;

interface Props {
    theme: ThemeState;
    onSetMode: (v: number) => void;
    onInversion: (v: number) => void;
    onBlueLight: (v: number) => void;
    onNavigate: (p: Page) => void;
}

function LandingPage({ theme, onSetMode, onInversion, onBlueLight, onNavigate }: Props) {
    const heroRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof gsap === "undefined" || !heroRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const tween = gsap.from(heroRef.current.children, {
            y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
        });
        return () => tween.kill();
    }, []);

    // Pass mode > 50 to the 3D bg as a "darker palette" hint
    const isDark = theme.mode > 50;

    return (
        <main id="main-content" className="landing" role="main" aria-label="Welcome">
            <TopographicBg isDark={isDark} />

            <div className="landing__corner">
                <ThemeControls theme={theme} onSetMode={onSetMode} onInversion={onInversion} onBlueLight={onBlueLight} />
            </div>

            <div ref={heroRef} className="landing__hero">
                <p className="landing__eyebrow">IP Address Tracker</p>
                <h1 className="landing__h1">Welcome.</h1>
                <p className="landing__lead">
                    Locate any IP address on an interactive map.
                </p>
                <p className="landing__sub">
                    See city, timezone, and ISP for any IP or domain. Save searches and trace your path across the world.
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