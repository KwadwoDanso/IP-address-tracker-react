// MapView.tsx — Leaflet map with theme-aware tiles, marker, and track path
//
// Research applied:
//   • flyTo duration: 0.35s (research-backed short purposeful motion;
//     was 0.8s — too long for a search workflow)
//   • Marker has alt + title for screen readers
//   • Tile layers swap in place when theme flips (no map remount)
//   • Track path is a dotted blue polyline using --brand-600 (#5262c6)

import { useEffect, useRef } from "react";
import type { IPData, HistoryItem } from "../types";

declare const L: any;

const LIGHT_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DARK_TILES = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_OPTS = { maxZoom: 19, attribution: "&copy; OpenStreetMap" };

interface Props {
    data: IPData | null;
    isDark: boolean;
    showTrackPath: boolean;
    history: HistoryItem[];
}

function MapView({ data, isDark, showTrackPath, history }: Props) {
    const mapRef = useRef<any>(null);
    const tilesRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const pathRef = useRef<any>(null);

    // Initialize map once. Cleanup clears Leaflet's internal flag so
    // StrictMode's double-effect in dev mode is safe.
    useEffect(() => {
        const container = document.getElementById("leaflet-map");
        if (!container || mapRef.current) return;

        const map = L.map(container, { zoomControl: true, scrollWheelZoom: true }).setView([0, 0], 2);
        tilesRef.current = L.tileLayer(isDark ? DARK_TILES : LIGHT_TILES, TILE_OPTS).addTo(map);

        const icon = L.icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        markerRef.current = L.marker([0, 0], { icon, alt: "IP location", title: "IP location" }).addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            tilesRef.current = null;
            markerRef.current = null;
            pathRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Swap tile layer on theme change (no remount)
    useEffect(() => {
        if (!mapRef.current || !tilesRef.current) return;
        mapRef.current.removeLayer(tilesRef.current);
        tilesRef.current = L.tileLayer(isDark ? DARK_TILES : LIGHT_TILES, TILE_OPTS).addTo(mapRef.current);
    }, [isDark]);

    // Move marker + flyTo new location — short purposeful motion (research-backed)
    useEffect(() => {
        if (!data || !mapRef.current) return;
        const { lat, lng } = data.location;
        mapRef.current.flyTo([lat, lng], 13, { animate: true, duration: 0.35, easeLinearity: 0.25 });
        markerRef.current.setLatLng([lat, lng]);
    }, [data]);

    // Track path — dotted blue polyline through every history point
    useEffect(() => {
        if (!mapRef.current) return;
        if (pathRef.current) {
            mapRef.current.removeLayer(pathRef.current);
            pathRef.current = null;
        }
        if (!showTrackPath || history.length < 1) return;
        const points = [...history].reverse().map((h) => [h.lat, h.lng] as [number, number]);
        pathRef.current = L.polyline(points, {
            color: "#5262c6", weight: 3, opacity: 0.85, dashArray: "8, 10",
        }).addTo(mapRef.current);
    }, [showTrackPath, history]);

    return (
        <div
            id="leaflet-map"
            className="map"
            role="application"
            aria-label="Map showing IP address location"
        />
    );
}

export default MapView;