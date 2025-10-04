import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Map, MapPin, Search } from "lucide-react";

const formatPrice = (price) => {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

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

export default function TruckMap({ trucks }) {
  const [mapComponents, setMapComponents] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCenter, setSearchCenter] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const trucksWithLocation = trucks.filter(
    (truck) => truck.latitude != null && truck.longitude != null
  );

  useEffect(() => {
    // Only load map components on client-side to avoid SSR issues
    if (typeof window !== 'undefined') {
      const loadMapComponents = async () => {
        try {
          const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
          const L = await import('leaflet');
          
          // Fix for default markers in react-leaflet
          delete L.default.Icon.Default.prototype._getIconUrl;
          L.default.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });

          setMapComponents({
            MapContainer,
            TileLayer,
            Marker,
            Popup,
            L: L.default
          });
          setMapLoaded(true);
        } catch (error) {
          console.error('Failed to load map components:', error);
        }
      };
      
      loadMapComponents();
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    const result = await geocodeAddress(query);
    
    if (result) {
      setSearchCenter([result.lat, result.lng]);
      // You could also zoom to this location if you have access to the map instance
    } else {
      alert('Location not found. Please try a different search term.');
    }
    setIsSearching(false);
  };

  if (trucksWithLocation.length === 0) {
    return (
      <div className="h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center text-center p-8">
        <div>
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">No trucks with location data</h3>
          <p className="text-gray-600 mt-2">
            {trucks.length > 0 
              ? `${trucks.length} truck${trucks.length > 1 ? 's' : ''} available, but none have location coordinates set.`
              : 'No trucks available.'
            }
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Contact dealers to add location information for better visibility.
          </p>
        </div>
      </div>
    );
  }

  // Calculate center of map
  const latitudes = trucksWithLocation.map(t => t.latitude);
  const longitudes = trucksWithLocation.map(t => t.longitude);
  const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
  const centerLon = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

  // Use search center if available, otherwise use calculated center
  const mapCenter = searchCenter || [centerLat, centerLon];
  const mapZoom = searchCenter ? 12 : 5; // Zoom in more when searching

  // Show loading state while map components load
  if (!mapLoaded || !mapComponents) {
    return (
      <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = mapComponents;

  return (
    <div className="w-full">
      {/* Map Search Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-medium text-gray-700">Search Map Location</h4>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location (e.g., Sacramento, CA)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin w-4 h-4 border-b-2 border-white rounded-full"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Search for a location to center the map view and see trucks in that area.
        </p>
      </div>

      {/* Location Info */}
      {trucksWithLocation.length < trucks.length && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Map View:</strong> Showing {trucksWithLocation.length} of {trucks.length} trucks with location data. 
            {trucks.length - trucksWithLocation.length} truck{trucks.length - trucksWithLocation.length > 1 ? 's' : ''} without coordinates not displayed.
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{trucksWithLocation.length}</div>
          <div className="text-xs text-gray-600">Trucks on Map</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {new Set(trucksWithLocation.map(t => `${t.latitude.toFixed(2)},${t.longitude.toFixed(2)}`)).size}
          </div>
          <div className="text-xs text-gray-600">Unique Locations</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            ${Math.round(trucksWithLocation.reduce((sum, t) => sum + (t.price || 0), 0) / trucksWithLocation.length).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Avg Price</div>
        </div>
      </div>
      
      <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          style={{ height: "100%", width: "100%" }}
          key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render when center changes
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {trucksWithLocation.map((truck) => (
            <Marker key={truck.id} position={[truck.latitude, truck.longitude]}>
              <Popup>
                <div className="w-80">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img 
                      src={truck.images?.[0] || `https://via.placeholder.com/300x200?text=${truck.year}+${truck.make}+${truck.model}`} 
                      alt={`${truck.year} ${truck.make} ${truck.model}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2">{`${truck.year} ${truck.make} ${truck.model}`}</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-green-600 font-semibold text-lg">{formatPrice(truck.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{truck.mileage?.toLocaleString()} mi</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Location:</span>
                      <span className="text-blue-600 text-sm">{truck.location || `${truck.latitude.toFixed(2)}, ${truck.longitude.toFixed(2)}`}</span>
                    </div>
                    {truck.condition && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Condition:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          truck.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                          truck.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                          truck.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {truck.condition}
                        </span>
                      </div>
                    )}
                  </div>
                  <Link to={createPageUrl(`TruckDetails?id=${truck.id}`)}>
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Clear search button */}
      {searchCenter && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setSearchCenter(null);
              setSearchQuery('');
            }}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            Reset to Default View
          </button>
        </div>
      )}
    </div>
  );
}