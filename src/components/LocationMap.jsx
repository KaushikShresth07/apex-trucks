import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click events
function MapClickHandler({ onLocationSelect, mode }) {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      if (mode === 'select') {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Selected Location<br />
        Lat: {position[0].toFixed(6)}<br />
        Lng: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

export default function LocationMap({ 
  initialLocation = null, 
  onLocationChange = () => {}, 
  mode = 'view', // 'view' or 'select'
  height = '400px',
  showControls = false,
  className = '',
  zoom = 13
}) {
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation.lat, initialLocation.lng]);
      setSelectedLocation(initialLocation);
    }
  }, [initialLocation]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    onLocationChange(location);
  };

  const handleSearchLocation = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (!query) return;

    // Simple geocoding using Nominatim (OpenStreetMap's geocoding service)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const location = { lat: parseFloat(lat), lng: parseFloat(lon) };
          setMapCenter([location.lat, location.lng]);
          setSelectedLocation(location);
          onLocationChange(location);
        } else {
          alert('Location not found. Please try a different search term.');
        }
      })
      .catch(error => {
        console.error('Geocoding error:', error);
        alert('Error searching for location. Please try again.');
      });
  };

  return (
    <div className={`location-map ${className}`}>
      {showControls && mode === 'select' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Location Controls</h4>
          <form onSubmit={handleSearchLocation} className="flex gap-2">
            <input
              name="search"
              type="text"
              placeholder="Search for a location (e.g., New York, NY)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            💡 Click anywhere on the map to set the location, or search for a specific place.
          </p>
        </div>
      )}

      <div 
        className="border border-gray-200 rounded-lg overflow-hidden"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mode === 'select' && (
            <MapClickHandler onLocationSelect={handleLocationSelect} mode={mode} />
          )}
          
          {mode === 'view' && selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                Truck Location<br />
                Lat: {selectedLocation.lat.toFixed(6)}<br />
                Lng: {selectedLocation.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected Location:</strong><br />
            Latitude: {selectedLocation.lat.toFixed(6)}<br />
            Longitude: {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
