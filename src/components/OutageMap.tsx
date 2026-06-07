"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { MapFeature, MapLayerType } from "@/lib/types";
import { layerColor, layerLabel } from "@/lib/layers";
import { formatReportTime } from "@/lib/format";
import {
  FIJI_CENTER,
  FIJI_MAP_OPTIONS,
  getFijiLatLngBounds,
  isInsideFiji,
} from "@/lib/fijiBounds";
import "leaflet/dist/leaflet.css";

const DEFAULT_ZOOM = 8;

/** Spread markers that share the same coords so each outage is tappable */
function spreadOverlappingMarkers(features: MapFeature[]): MapFeature[] {
  const groups = new Map<string, MapFeature[]>();

  for (const feature of features) {
    const key = `${feature.latitude.toFixed(4)},${feature.longitude.toFixed(4)}`;
    const group = groups.get(key) ?? [];
    group.push(feature);
    groups.set(key, group);
  }

  const spread: MapFeature[] = [];

  for (const group of groups.values()) {
    group.forEach((feature, index) => {
      if (index === 0) {
        spread.push(feature);
        return;
      }

      const angle = (2 * Math.PI * index) / group.length;
      const radius = 0.012;
      spread.push({
        ...feature,
        latitude: feature.latitude + radius * Math.cos(angle),
        longitude: feature.longitude + radius * Math.sin(angle),
      });
    });
  }

  return spread;
}

function createSubmittedIcon() {
  const s = 26;
  return L.divIcon({
    className: "outage-marker",
    html: `<span class="marker-pulse" style="
      position:relative;display:block;width:${s}px;height:${s}px;border-radius:50%;
      background:#ea580c;border:3px solid #fff;color:#ea580c;
      box-shadow:0 2px 10px rgba(234,88,12,.45);
    "></span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

function SubmittedReportMarker({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    markerRef.current?.openPopup();
  }, [lat, lng]);

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={createSubmittedIcon()}
      zIndexOffset={2000}
    >
      <Popup>
        <span className="map-popup-title">Your report</span>
        <p className="map-popup-meta mt-1 text-orange-700">
          Just submitted — orange pulsing dot
        </p>
      </Popup>
    </Marker>
  );
}

function createPickedIcon() {
  const s = 28;
  return L.divIcon({
    className: "picked-marker",
    html: `<span style="
      display:block;width:${s}px;height:${s}px;border-radius:50%;
      background:#0d9488;border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.28);
    "></span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

function createLayerIcon(layer: MapLayerType, size = 18) {
  const color = layerColor(layer);
  const isActive = layer === "active_reported";
  const pulse = isActive ? "marker-pulse" : "";
  const s = layer === "active_reported" ? 22 : size;

  return L.divIcon({
    className: "outage-marker",
    html: `<span class="${pulse}" style="
      position:relative;display:block;width:${s}px;height:${s}px;border-radius:50%;
      background:${color};border:2.5px solid #fff;color:${color};
      box-shadow:0 2px 6px rgba(0,0,0,.2);
    "></span>`,
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

function MapClickHandler({
  onMapClick,
  pickMode,
}: {
  onMapClick?: (lat: number, lng: number) => void;
  pickMode?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!pickMode || !onMapClick) return;
      const { lat, lng } = e.latlng;
      if (!isInsideFiji(lat, lng)) return;
      onMapClick(lat, lng);
    },
  });
  return null;
}

interface OutageMapProps {
  features: MapFeature[];
  pickMode?: boolean;
  pickedPosition?: { lat: number; lng: number } | null;
  submittedReport?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
}

export default function OutageMap({
  features,
  pickMode,
  pickedPosition,
  submittedReport,
  onMapClick,
}: OutageMapProps) {
  const fijiBounds = getFijiLatLngBounds();

  return (
    <MapContainer
      center={FIJI_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={FIJI_MAP_OPTIONS.minZoom}
      maxZoom={FIJI_MAP_OPTIONS.maxZoom}
      maxBounds={fijiBounds}
      maxBoundsViscosity={FIJI_MAP_OPTIONS.maxBoundsViscosity}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        noWrap
      />
      <MapClickHandler onMapClick={onMapClick} pickMode={pickMode} />
      {pickedPosition && isInsideFiji(pickedPosition.lat, pickedPosition.lng) && (
        <>
          <CircleMarker
            center={[pickedPosition.lat, pickedPosition.lng]}
            radius={14}
            pathOptions={{
              color: "#0f766e",
              fillColor: "#14b8a6",
              fillOpacity: 0.95,
              weight: 3,
            }}
            interactive={false}
          />
          <Marker
            position={[pickedPosition.lat, pickedPosition.lng]}
            icon={createPickedIcon()}
            interactive={false}
            zIndexOffset={1000}
          />
        </>
      )}
      {submittedReport &&
        isInsideFiji(submittedReport.lat, submittedReport.lng) && (
          <SubmittedReportMarker
            lat={submittedReport.lat}
            lng={submittedReport.lng}
          />
        )}
      {spreadOverlappingMarkers(
        features.filter((f) => isInsideFiji(f.latitude, f.longitude))
      ).map((f) => {
          const layer = f.kind === "planned" ? f.layer : f.layer;
          return (
            <Marker
              key={`${f.kind}-${f.id}`}
              position={[f.latitude, f.longitude]}
              icon={createLayerIcon(layer)}
              interactive={!pickMode}
            >
              <Popup>
                <div>
                  <p className="map-popup-title">{f.location}</p>
                  <span
                    className="map-popup-badge"
                    style={{ background: layerColor(layer) }}
                  >
                    {f.kind === "planned"
                      ? layer === "cleared"
                        ? "Planned · ended"
                        : "Planned outage (EFL)"
                      : `${layerLabel(layer)} · ${f.confidence}%`}
                  </span>
                  {f.kind === "planned" ? (
                    <div className="map-popup-meta">
                      <div>
                        {formatReportTime(f.start_time)} →{" "}
                        {formatReportTime(f.end_time)}
                      </div>
                      <div className="mt-1 text-blue-700 font-medium">
                        EFL planned maintenance
                      </div>
                      {f.reason && (
                        <p className="map-popup-desc">{f.reason}</p>
                      )}
                    </div>
                  ) : (
                    <div className="map-popup-meta">
                      <div>{formatReportTime(f.latestReported)}</div>
                      <div>
                        {f.reportCount} report{f.reportCount !== 1 ? "s" : ""} ·
                        unplanned
                      </div>
                      {f.description && (
                        <p className="map-popup-desc">{f.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}
