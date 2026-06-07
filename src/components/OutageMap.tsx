"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
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
  onMapClick?: (lat: number, lng: number) => void;
}

export default function OutageMap({
  features,
  pickMode,
  pickedPosition,
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
      {pickMode && onMapClick && (
        <MapClickHandler onMapClick={onMapClick} pickMode={pickMode} />
      )}
      {pickedPosition && isInsideFiji(pickedPosition.lat, pickedPosition.lng) && (
        <Marker position={[pickedPosition.lat, pickedPosition.lng]}>
          <Popup>
            <span className="map-popup-title">Selected location</span>
          </Popup>
        </Marker>
      )}
      {features
        .filter((f) => isInsideFiji(f.latitude, f.longitude))
        .map((f) => {
          const layer = f.kind === "planned" ? f.layer : f.layer;
          return (
            <Marker
              key={`${f.kind}-${f.id}`}
              position={[f.latitude, f.longitude]}
              icon={createLayerIcon(layer)}
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
