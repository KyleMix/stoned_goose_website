"use client";

import { useEffect, useRef } from "react";
import type { OpenMic } from "@/content/open-mics";

// Leaflet map for the Open Mic Explorer. Loaded only on /open-mics, where
// the Suspense fallback is the inline list. Touches `window` and uses
// Leaflet's CSS so it has to be a client component, dynamically imported
// from the page.
//
// We import Leaflet via a runtime dynamic import inside useEffect rather
// than at the top of the file so SSR (and the static export build step)
// never executes the Leaflet bundle.

const TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type Props = {
  mics: OpenMic[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function OpenMicMap({ mics, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown | null>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const onSelectRef = useRef(onSelect);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | null = null;

    async function init() {
      if (!containerRef.current) return;
      const L = await import("leaflet");
      if (disposed || !containerRef.current) return;
      leafletRef.current = L;

      const center = mics.length
        ? [averageLat(mics), averageLng(mics)]
        : [47.0379, -122.9007];

      const map = L.map(containerRef.current, {
        center: center as [number, number],
        zoom: mics.length > 1 ? 8 : 11,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 18,
      }).addTo(map);

      const icon = L.divIcon({
        className: "open-mic-pin",
        html: '<span aria-hidden="true"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      mics.forEach((m) => {
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<strong>${escapeHtml(m.name)}</strong><br/>${escapeHtml(m.venue)}<br/>${escapeHtml(m.day)} / ${escapeHtml(m.time)}`,
        );
        marker.on("click", () => onSelectRef.current?.(m.id));
        markersRef.current.set(m.id, marker);
      });

      if (mics.length > 1) {
        const bounds = L.latLngBounds(mics.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds.pad(0.2));
      }

      cleanup = () => {
        markersRef.current.clear();
        map.remove();
        mapRef.current = null;
      };
    }

    init();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [mics]);

  useEffect(() => {
    if (!selectedId) return;
    const map = mapRef.current as { setView?: (latlng: [number, number], zoom: number) => unknown } | null;
    const marker = markersRef.current.get(selectedId) as
      | { openPopup?: () => unknown; getLatLng?: () => { lat: number; lng: number } }
      | undefined;
    if (!map || !marker?.getLatLng || !map.setView) return;
    const { lat, lng } = marker.getLatLng();
    map.setView([lat, lng], 13);
    marker.openPopup?.();
  }, [selectedId]);

  return (
    <>
      <div
        ref={containerRef}
        role="region"
        aria-label="Open mics map"
        className="aspect-[4/3] w-full overflow-hidden border border-bone/15 bg-haze-500 md:aspect-[16/10]"
      />
      <style jsx global>{`
        .open-mic-pin {
          background: transparent;
          border: 0;
        }
        .open-mic-pin span {
          display: block;
          width: 22px;
          height: 22px;
          background: #f1c40f;
          border: 2px solid #0a0a0a;
          border-radius: 9999px;
          box-shadow: 0 0 0 2px rgba(241, 196, 15, 0.35);
        }
        .leaflet-popup-content {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
        }
      `}</style>
    </>
  );
}

function averageLat(mics: OpenMic[]) {
  return mics.reduce((s, m) => s + m.lat, 0) / mics.length;
}

function averageLng(mics: OpenMic[]) {
  return mics.reduce((s, m) => s + m.lng, 0) / mics.length;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
