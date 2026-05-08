// ThemeControls.tsx — three gradient sliders: theme mode, inversion, night mode
// Mode is now continuous 0-100 (no snap) so the slider produces smooth
// gradient interpolation between light and dark via CSS color-mix().

import type { ChangeEvent } from "react";
import type { ThemeState } from "../types";

const TRACK_MODE = "linear-gradient(to right, #ffffff 0%, #94a3b8 50%, #0a0a14 100%)";
const TRACK_INV = "linear-gradient(to right, #10b981 0%, #6366f1 50%, #ef4444 100%)";
const TRACK_NIGHT = "linear-gradient(to right, #fde68a 0%, #f59e0b 50%, #92400e 100%)";

interface Props {
    theme: ThemeState;
    onSetMode: (v: number) => void;
    onInversion: (v: number) => void;
    onBlueLight: (v: number) => void;
}

function ThemeControls({ theme, onSetMode, onInversion, onBlueLight }: Props) {
    const modeLabel = theme.mode < 25 ? "Light" : theme.mode < 75 ? "Mid" : "Dark";

    return (
        <div className="theme-card" role="region" aria-label="Display preferences">
            <div>
                <div className="theme-row__label">
                    <span>Theme Mode</span>
                    <span>{modeLabel} · {Math.round(theme.mode)}%</span>
                </div>
                <input
                    type="range" min={0} max={100} step={1} value={theme.mode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onSetMode(Number(e.target.value))}
                    className="slider" style={{ background: TRACK_MODE }}
                    aria-label="Theme mode from light to dark"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(theme.mode)}
                />
            </div>
            <div>
                <div className="theme-row__label"><span>Invert Colors</span><span>{theme.inversion}%</span></div>
                <input
                    type="range" min={0} max={100} step={1} value={theme.inversion}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onInversion(Number(e.target.value))}
                    className="slider" style={{ background: TRACK_INV }}
                    aria-label="Color inversion percentage"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={theme.inversion}
                />
            </div>
            <div>
                <div className="theme-row__label"><span>Night Mode</span><span>{theme.blueLight}%</span></div>
                <input
                    type="range" min={0} max={100} step={1} value={theme.blueLight}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onBlueLight(Number(e.target.value))}
                    className="slider" style={{ background: TRACK_NIGHT }}
                    aria-label="Night mode filter intensity"
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={theme.blueLight}
                />
            </div>
        </div>
    );
}

export default ThemeControls;