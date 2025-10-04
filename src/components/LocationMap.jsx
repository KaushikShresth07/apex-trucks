import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Dynamically import react-leaflet components to avoid SSR issues
const MapComponents = React.lazy(() =>
  import('react-leaflet').then(module => ({
    default: {
      MapContainer: module.MapContainer,
      TileLayer: module.TileLayer,
      Marker: module.Marker,
      Popup: module.Popup,
      useMapEvents: module.useMapEvents,
    }
  }))
);

// Geocoding service for address-to-coordinates conversion
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=us`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocoding service for coordinates-to-address conversion
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`);
    const data = await response.json();
    if (data && data.address) {
      const { address } = data;
      return `${address.city || address.town || address.village || ''}, ${address.state || address.county || ''}`.trim().replace(/,$/, '');
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

function MapClickHandler({ onLocationSelect, mode, selectedLocation }) {
  const map = MapComponents.default.useMapEvents({
    click: (e) => {
      if (mode === 'select') {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function LocationMap({ 
  initialLocation = null, 
  onLocationChange = () => {}, 
  mode = 'view', // 'view', 'select', or 'edit'
  height = '400px',
  showControls = true,
  className = '',
  zoom = 5,
  enableGeocoding = true,
  showAddressInput = true
}) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapCenter, setMapCenter] = useState(initialLocation ? [initialLocation.lat, initialLocation.lng] : [40.7128, -74.0060]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [displayAddress, setDisplayAddress] = useState('');
  const mapRef = useRef();

  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter([initialLocation.lat, initialLocation.lng]);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (selectedLocation && enableGeocoding) {
      // Update display address when location changes
      reverseGeocode(selectedLocation.lat, selectedLocation.lng).then(address => {
        setDisplayAddress(address);
      });
    }
  }, [selectedLocation, enableGeocoding]);

  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    
    if (enableGeocoding) {
      const address = await reverseGeocode(location.lat, location.lng);
      setDisplayAddress(address);
      onLocationChange({ ...location, address });
    } else {
      onLocationChange(location);
    }

    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], zoom);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchAddress.trim();
    if (!query || !enableGeocoding) return;

    setIsLoading(true);
    const result = await geocodeAddress(query);
    
    if (result) {
      const location = { lat: result.lat, lng: result.lng };
      setSelectedLocation(location);
      setMapCenter([location.lat, location.lng]);
      setDisplayAddress(result.address);
      onLocationChange({ ...location, address: result.address });
      
      if (mapRef.current) {
        mapRef.current.setView([location.lat, location.lng], zoom);
      }
    } else {
      alert('Location not found. Please try a different search term.');
    }
    setIsLoading(false);
  };

  const resetLocation = () => {
    setSelectedLocation(null);
    setDisplayAddress('');
    setSearchAddress('');
    onLocationChange(null);
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, zoom);
    }
  };

  return (
    <div className={`location-map ${className}`}>
      {showControls && (mode === 'select' || mode === 'edit') && enableGeocoding && showAddressInput && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Location Search & Selection</h4>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Search for a location (e.g., Sacramento, CA)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !searchAddress.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            💡 Click anywhere on the map to set the location, or search for a specific place.
          </p>
          {selectedLocation && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={resetLocation}
                className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                Clear Location
              </button>
            </div>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height }}>
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        }>
          <MapComponents.MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            whenCreated={mapInstance => { mapRef.current = mapInstance }}
          >
            <MapComponents.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {(mode === 'select' || mode === 'edit') && (
              <MapClickHandler 
                onLocationSelect={handleLocationSelect} 
                mode={mode} 
                selectedLocation={selectedLocation}
              />
            )}

            {selectedLocation && (mode === 'view' || mode === 'edit') && (
              <MapComponents.Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <MapComponents.Popup>
                  <div className="text-center">
                    <strong>Truck Location</strong><br />
                    {displayAddress || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}<br />
                    <small className="text-gray-500">
                      Lat: {selectedLocation.lat.toFixed(6)}<br />
                      Lng: {selectedLocation.lng.toFixed(6)}
                    </small>
                  </div>
                </MapComponents.Popup>
              </MapComponents.Marker>
            )}

            {(mode === 'select' || mode === 'edit') && selectedLocation && (
              <MapComponents.Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                <MapComponents.Popup>
                  <div className="text-center">
                    <strong>Selected Location</strong><br />
                    {displayAddress || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}<br />
                    <small className="text-gray-500">
                      Lat: {selectedLocation.lat.toFixed(6)}<br />
                      Lng: {selectedLocation.lng.toFixed(6)}
                    </small>
                    <br />
                    <button
                      onClick={() => {
                        if (window.confirm('Remove this location?')) {
                          resetLocation();
                        }
                      }}
                      className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </MapComponents.Popup>
              </MapComponents.Marker>
            )}
          </MapComponents.MapContainer>
        </React.Suspense>
      </div>

      {selectedLocation && showControls && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selected Location:</strong><br />
            {displayAddress || `Coordinates: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}<br />
            <small className="text-blue-600">
              Lat: {selectedLocation.lat.toFixed(6)} • Lng: {selectedLocation.lng.toFixed(6)}
            </small>
          </p>
        </div>
      )}
    </div>
  );
}