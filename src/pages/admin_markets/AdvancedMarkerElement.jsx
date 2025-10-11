import { useEffect, useRef, useState, useMemo } from "react";
import { GoogleMap } from "@react-google-maps/api";

export default function MapWithAdvancedMarker({ lat, lng, onMapClick, onPositionChange, zoomOnSearch = 16 }) {
  const [map, setMap] = useState(null);
  const markerRef = useRef(null);
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const mapOptions = useMemo(() => ({ mapId: MAP_ID, clickableIcons: false, tilt: 0, heading: 0 }), [MAP_ID]);
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker) return;
    const { AdvancedMarkerElement } = window.google.maps.marker;

    if (!markerRef.current) {
      markerRef.current = new AdvancedMarkerElement({
        map,
        position: { lat, lng },
        gmpDraggable: false, // ✅ ปิดการลาก
      });
    } else {
      markerRef.current.position = { lat, lng };
    }
  }, [map, lat, lng]);

  useEffect(() => {
    if (!map) return;
    map.setCenter({ lat, lng });
    map.panTo({ lat, lng });

    if (typeof zoomOnSearch === "number" && zoomOnSearch > 0) {
      const currentZoom = map.getZoom?.() ?? 0;
      if (currentZoom < zoomOnSearch) {
        map.setZoom(zoomOnSearch);
      }
    }
  }, [map, lat, lng, zoomOnSearch]);

  // ✅ จัดการคลิกบนแผนที่
  const handleMapClick = (e) => {
    if (e.latLng && onMapClick) {
      onMapClick({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  };

  return (
    <GoogleMap
      onLoad={(m) => setMap(m)}
      center={center}
      zoom={14}
      mapContainerStyle={containerStyle}
      options={mapOptions}
      onClick={handleMapClick} // ✅ เพิ่มการคลิกบนแผนที่
    />
  );
}