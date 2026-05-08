// types/index.ts — all shared types

export interface IPData {
    ip: string;
    isp: string;
    location: { city: string; region: string; postalCode: string; timezone: string; lat: number; lng: number };
}

export interface ThemeState {
    mode: number; // 0 = light, 100 = dark, intermediate values blend smoothly
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
