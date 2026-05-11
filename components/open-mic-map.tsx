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
  const clusterRef = useRef<unknown | null>(null);
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
      const leafletModule = await import("leaflet");
      // Leaflet's ESM bundle exports the L object as default; some bundlers
      // expose it as the namespace itself. Coalesce to whichever shape we got.
      const L: typeof import("leaflet") =
        (leafletModule as unknown as { default?: typeof import("leaflet") })
          .default ?? leafletModule;
      // leaflet.markercluster is a side-effect plugin that extends window.L
      // rather than its own export. We have to expose the same Leaflet
      // instance globally before importing the plugin so the plugin's
      // L.markerClusterGroup attaches to the L we use below.
      (window as unknown as { L: typeof import("leaflet") }).L = L;
      await import("leaflet.markercluster");
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

      // Cluster group spiderfies dense pins (Olympia/Tacoma overlap at low
      // zoom). Cluster icons styled in the global CSS block below to match
      // the hazard-yellow pin language.
      const cluster = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        chunkedLoading: true,
        maxClusterRadius: 48,
        iconCreateFunction: (c) => {
          const count = c.getChildCount();
          const size = count >= 25 ? 56 : count >= 10 ? 46 : 36;
          return L.divIcon({
            html: `<span aria-hidden="true">${count}</span>`,
            className: "open-mic-cluster",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });

      mics.forEach((m) => {
        const marker = L.marker([m.lat, m.lng], { icon });
        marker.bindPopup(
          `<strong>${escapeHtml(m.name)}</strong><br/>${escapeHtml(m.venue)}<br/>${escapeHtml(m.day)} / ${escapeHtml(m.time)}`,
        );
        marker.on("click", () => onSelectRef.current?.(m.id));
        cluster.addLayer(marker);
        markersRef.current.set(m.id, marker);
      });
      map.addLayer(cluster);
      clusterRef.current = cluster;

      if (mics.length > 1) {
        const bounds = L.latLngBounds(mics.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds.pad(0.2));
      }

      cleanup = () => {
        markersRef.current.clear();
        clusterRef.current = null;
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
    const marker = markersRef.current.get(selectedId) as
      | { openPopup?: () => unknown; getLatLng?: () => { lat: number; lng: number } }
      | undefined;
    if (!marker?.getLatLng) return;
    // markercluster handles zoom-and-spiderfy via `zoomToShowLayer` so a
    // clustered marker actually opens. Falls back to setView for unclustered
    // contexts (defensive — should always be clustered now).
    const cluster = clusterRef.current as
      | { zoomToShowLayer?: (m: unknown, cb: () => void) => void }
      | null;
    if (cluster?.zoomToShowLayer) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup?.());
      return;
    }
    const map = mapRef.current as
      | { setView?: (latlng: [number, number], zoom: number) => unknown }
      | null;
    if (!map?.setView) return;
    const { lat, lng } = marker.getLatLng();
    map.setView([lat, lng], 13);
    marker.openPopup?.();
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Open mics map"
      className="aspect-[4/3] w-full overflow-hidden border border-bone/15 bg-haze-500 md:aspect-[16/10]"
    />
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
