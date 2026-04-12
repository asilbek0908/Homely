import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// leaflet's default icons break with Vite — point them to the CDN instead
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ClickHandler = ({ onPick }) => {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
};

const FlyTo = ({ position }) => {
  const map = useMap();
  map.flyTo([position.lat, position.lng], map.getZoom());
  return null;
};

const MapPicker = ({ onAddressSelect }) => {
  const [position, setPosition] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState('');

  const handlePick = async (latlng) => {
    setPosition(latlng);
    setResolving(true);
    setResolved('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const address = data.display_name || `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
      setResolved(address);
      onAddressSelect(address, latlng);
    } catch {
      const fallback = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
      setResolved(fallback);
      onAddressSelect(fallback, latlng);
    } finally {
      setResolving(false);
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setResolving(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePick({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setResolving(false),
      { maximumAge: 0, timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Click on the map to pin your location</span>
        <button
          type="button"
          onClick={handleGeolocate}
          className="text-xs text-[#1A56DB] hover:underline flex items-center gap-1"
        >
          📍 Use my location
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <MapContainer
          center={[41.2995, 69.2401]}
          zoom={12}
          style={{ height: '220px', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onPick={handlePick} />
          {position && <FlyTo position={position} />}
          {position && <Marker position={position} />}
        </MapContainer>
      </div>

      {resolving && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span className="w-3 h-3 border-2 border-gray-300 border-t-[#1A56DB] rounded-full animate-spin inline-block" />
          Getting address…
        </p>
      )}
      {resolved && !resolving && (
        <p className="text-xs text-green-600 flex items-start gap-1">
          ✅ <span className="line-clamp-2">{resolved}</span>
        </p>
      )}
    </div>
  );
};

export default MapPicker;
