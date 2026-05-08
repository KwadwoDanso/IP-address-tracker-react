// types/index.ts — all shared types

export interface IPData {
    ip: string;
    isp: string;
    location: { city: string; region: string; postalCode: string; timezone: string; lat: number; lng: number };
}

export interface ThemeState {
    mode: "light" | "dark";
    inversion: number;
    blueLight: number;
}

export interface HistoryItem {
    id: string;
    ip: string;
    city: string;
    region: string;
    lat: number;
    lng: number;
    timestamp: number;
}

export type Page = "landing" | "tracker" | "saved" | "about";