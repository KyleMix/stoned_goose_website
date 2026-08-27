"use client";

import { useEffect, useRef, useState } from "react";
import type { NormalizedOpenMic } from "@/content/open-mics";
// Vendor CSS imported here (not globals.css) so it ships with this
// dynamically-loaded chunk on /open-mics/map instead of every page.
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

// Leaflet map for the open mic map. Loaded only on /open-mics/map, where
// the Suspense fallback is the inline list. Touches `window` and uses
// Leaflet's CSS so it has to be a client component, dynamically imported
// from the page.
//
// We import Leaflet via a runtime dynamic import inside useEffect rather
// than at the top of the file so SSR (and the static export build step)
// never executes the Leaflet bundle.

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type Props = {
  mics: NormalizedOpenMic[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export function OpenMicMap({ mics, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // True when the Leaflet runtime failed to load (offline, blocked CDN,
  // chunk error). The list below the map stays fully usable either way.
  const [failed, setFailed] = useState(false);
  const mapRef = useRef<unknown | null>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const clusterRef = useRef<unknown | null>(null);
  const onSelectRef = useRef(onSelect);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  // Default (hazard) and selected (slime) divIcons, plus a handle on the marker
  // currently shown as selected so we can revert it when selection moves.
  const defaultIconRef = useRef<unknown | null>(null);
  const selectedIconRef = useRef<unknown | null>(null);
  const selectedMarkerRef = useRef<unknown | null>(null);

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
      // Slime variant marks the selected mic. Same geometry as the default so
      // swapping icons never shifts the pin. Both kept on refs for the
      // selectedId effect below.
      const selectedIcon = L.divIcon({
        className: "open-mic-pin open-mic-pin--selected",
        html: '<span aria-hidden="true"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      defaultIconRef.current = icon;
      selectedIconRef.current = selectedIcon;
      selectedMarkerRef.current = null;

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
            // Leaflet gives every marker role="button" and tabindex 0, so
            // the count alone is not an accessible name. The visible glyph
            // stays hidden and a real one rides along beside it.
            html: `<span aria-hidden="true">${count}</span><span class="sr-only">Zoom to ${count} open mics in this area</span>`,
            className: "open-mic-cluster",
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });

      mics.forEach((m) => {
        // Same reason as the cluster icons: the pin is a role="button" whose
        // only content is aria-hidden. Leaflet writes options.title onto the
        // icon element, which names it.
        const marker = L.marker([m.lat, m.lng], { icon, title: m.nameDisplay });
        marker.bindPopup(
          `<strong>${escapeHtml(m.nameDisplay)}</strong><br/>${escapeHtml(m.venueDisplay)}<br/>${escapeHtml(m.dayTimeDisplay)}`,
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

    init().catch((err) => {
      console.error("[open-mic-map] failed to load Leaflet", err);
      if (!disposed) setFailed(true);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [mics]);

  useEffect(() => {
    type IconMarker = {
      openPopup?: () => unknown;
      getLatLng?: () => { lat: number; lng: number };
      setIcon?: (icon: unknown) => unknown;
    };

    // Revert the previously selected pin to the default (hazard) icon before
    // doing anything else, so deselection and moving the selection both clear
    // the slime state.
    const prev = selectedMarkerRef.current as IconMarker | null;
    if (prev?.setIcon && defaultIconRef.current) {
      prev.setIcon(defaultIconRef.current);
    }
    selectedMarkerRef.current = null;

    if (!selectedId) return;
    const marker = markersRef.current.get(selectedId) as IconMarker | undefined;
    if (!marker?.getLatLng) return;

    // Mark the active mic with the slime icon and remember it for next time.
    if (marker.setIcon && selectedIconRef.current) {
      marker.setIcon(selectedIconRef.current);
      selectedMarkerRef.current = marker;
    }

    // markercluster handles zoom-and-spiderfy via `zoomToShowLayer` so a
    // clustered marker actually opens. Falls back to setView for unclustered
    // contexts. Defensive. Should always be clustered now.
    const cluster = clusterRef.current as {
      zoomToShowLayer?: (m: unknown, cb: () => void) => void;
    } | null;
    if (cluster?.zoomToShowLayer) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup?.());
      return;
    }
    const map = mapRef.current as {
      setView?: (latlng: [number, number], zoom: number) => unknown;
    } | null;
    if (!map?.setView) return;
    const { lat, lng } = marker.getLatLng();
    map.setView([lat, lng], 13);
    marker.openPopup?.();
  }, [selectedId]);

  // `isolate` keeps Leaflet's internal z-indexes (panes ~400-700, markers,
  // controls ~1000) inside this container's stacking context so they can't
  // poke through modals/overlays (e.g. the "Report a change" dialog).
  if (failed) {
    return (
      <div
        role="region"
        aria-label="Open mics map"
        className="flex aspect-[4/3] w-full items-center justify-center border border-smoke bg-surface-tuxedo px-6 text-center md:aspect-[16/10]"
      >
        <p className="t-body max-w-sm text-sm">
          The map did not load. Every mic is still in the list below.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Open mics map"
      className="aspect-[4/3] w-full isolate overflow-hidden border border-smoke bg-surface-tuxedo md:aspect-[16/10]"
    />
  );
}

function averageLat(mics: NormalizedOpenMic[]) {
  return mics.reduce((s, m) => s + m.lat, 0) / mics.length;
}

function averageLng(mics: NormalizedOpenMic[]) {
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
