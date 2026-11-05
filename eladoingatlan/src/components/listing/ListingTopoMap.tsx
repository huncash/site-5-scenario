"use client";

import { useEffect, useId, useRef } from "react";

import { LISTING_COORDS } from "@/lib/listing";

/**
 * Leaflet is loaded from unpkg at runtime — never `import` leaflet or its
 * marker PNGs. Webpack/sharp must not touch those assets on the VPS build.
 */

type ListingTopoMapProps = {
  /** helyi túra / regionális áttekintő */
  mode: "local" | "regional";
  caption: string;
};

type LeafletMap = {
  setView: (latlng: [number, number], zoom: number) => unknown;
  remove: () => void;
};

type LeafletMarker = {
  addTo: (map: LeafletMap) => LeafletMarker;
  bindPopup: (html: string) => unknown;
};

type LeafletIcon = unknown;

type LeafletNS = {
  map: (el: HTMLElement, opts?: { scrollWheelZoom?: boolean }) => LeafletMap;
  tileLayer: (
    url: string,
    opts: { maxZoom?: number; attribution?: string }
  ) => { addTo: (map: LeafletMap) => unknown };
  icon: (opts: {
    iconUrl: string;
    iconRetinaUrl?: string;
    shadowUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
    shadowSize?: [number, number];
  }) => LeafletIcon;
  marker: (latlng: [number, number], opts?: { icon?: LeafletIcon }) => LeafletMarker;
};

declare global {
  interface Window {
    L?: LeafletNS;
  }
}

const LEAFLET_VERSION = "1.9.4";
const LEAFLET_CDN = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist`;

/** Absolute CDN URLs — avoids bundling marker-icon.png through webpack/sharp. */
function createCdnMarkerIcon(L: LeafletNS): LeafletIcon {
  return L.icon({
    iconUrl: `${LEAFLET_CDN}/images/marker-icon.png`,
    iconRetinaUrl: `${LEAFLET_CDN}/images/marker-icon-2x.png`,
    shadowUrl: `${LEAFLET_CDN}/images/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

let leafletLoader: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.L) return Promise.resolve();
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    const cssId = "listing-leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = `${LEAFLET_CDN}/leaflet.css`;
      document.head.appendChild(link);
    }
    const existing = document.getElementById("listing-leaflet-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("leaflet load failed")));
      if (window.L) resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "listing-leaflet-js";
    script.src = `${LEAFLET_CDN}/leaflet.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("leaflet load failed"));
    document.body.appendChild(script);
  });

  return leafletLoader;
}

export function ListingTopoMap({ mode, caption }: ListingTopoMapProps) {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then(() => {
        if (cancelled || !containerRef.current || !window.L) return;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const L = window.L;
        const zoom = mode === "local" ? 15 : 11;
        const center: [number, number] =
          mode === "local" ? [LISTING_COORDS.lat, LISTING_COORDS.lng] : [47.82, 18.95];

        const map = L.map(containerRef.current, { scrollWheelZoom: false });
        map.setView(center, zoom);
        L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
        }).addTo(map);
        L.marker([LISTING_COORDS.lat, LISTING_COORDS.lng], { icon: createCdnMarkerIcon(L) })
          .addTo(map)
          .bindPopup("Kismaros-Börzsönyliget · Hörcsög utca");
        mapRef.current = map;
      })
      .catch(() => {
        /* map container stays empty on load failure */
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mode]);

  return (
    <figure className="mt-4 overflow-hidden rounded-lg border border-[#d4c9b5] bg-[#f7f1e6]">
      <div
        id={`listing-topo-${mapId}`}
        ref={containerRef}
        className="h-[280px] w-full sm:h-[360px] md:h-[420px]"
        role="img"
        aria-label={mode === "local" ? "OpenTopoMap turistatérkép a telek körül" : "OpenTopoMap regionális áttekintő"}
      />
      <figcaption className="border-t border-[#d4c9b5] px-4 py-3 text-sm leading-relaxed text-[#5a5146]">
        {caption}{" "}
        <span className="text-xs text-[#6b6154]">Térkép: OpenTopoMap / OpenStreetMap.</span>
      </figcaption>
    </figure>
  );
}
