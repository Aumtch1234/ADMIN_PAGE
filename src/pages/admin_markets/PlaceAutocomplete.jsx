// PlaceAutocompleteElement.jsx
import { useEffect, useRef } from "react";

/**
 * Props:
 *  - onSelect: ({ lat, lng, address, place }) => void
 *  - options?: PlaceAutocompleteElementOptions (e.g. includedRegionCodes, locationBias, types)
 *  - className?: string  // คลาสของ wrapper div (ไม่ใช่ input ภายในของ Google)
 */
export default function PlaceAutocompleteElement({ onSelect, options = {}, className }) {
  const hostRef = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    let pacEl;
    let mounted = true;

    (async () => {
      // โหลดไลบรารี Places (new)
      await google.maps.importLibrary("places");

      if (!mounted || !hostRef.current) return;

      // สร้าง element ตัวใหม่
      pacEl = new google.maps.places.PlaceAutocompleteElement({
        // ตั้งค่าเริ่มต้นที่ต้องการได้ที่นี่
        ...options,
      });

      // ฟังอีเวนต์แบบใหม่: 'gmp-select'
      pacEl.addEventListener("gmp-select", async ({ placePrediction }) => {
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ["formattedAddress", "location", "displayName", "viewport"] });

        const loc = place.location;
        const lat = typeof loc?.lat === "function" ? loc.lat() : loc?.lat;
        const lng = typeof loc?.lng === "function" ? loc.lng() : loc?.lng;

        if (typeof lat === "number" && typeof lng === "number") {
          onSelect?.({
            lat,
            lng,
            address: place.formattedAddress || "",
            place,
          });
        }
      });

      // ใส่ element ลง DOM
      hostRef.current.appendChild(pacEl);
      elementRef.current = pacEl;
    })();

    return () => {
      mounted = false;
      if (elementRef.current?.parentNode) {
        elementRef.current.parentNode.removeChild(elementRef.current);
      }
      elementRef.current = null;
    };
  }, [onSelect, options]);

  return <div ref={hostRef} className={className} />;
}
