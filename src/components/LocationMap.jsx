import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation, CheckCircle, AlertCircle } from "lucide-react";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom marker icon for selected location
const selectedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  return null;
}

// Component to handle map center updates
function MapCenterHandler({ center, onCenterChange }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  useEffect(() => {
    const handleMove = () => {
      const currentCenter = map.getCenter();
      onCenterChange(currentCenter.lat, currentCenter.lng);
    };

    map.on('moveend', handleMove);
    return () => {
      map.off('moveend', handleMove);
    };
  }, [map, onCenterChange]);

  return null;
}

export default function LocationMap({ 
  initialLocation = null, 
  onLocationChange, 
  mode = "select", // "select" or "display"
  height = "400px",
  showControls = true,
  className = ""
}) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapCenter, setMapCenter] = useState(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [39.8283, -98.5795] // Center of USA
  );
  const [manualCoords, setManualCoords] = useState({
    lat: initialLocation?.lat || "",
    lng: initialLocation?.lng || ""
  });
  const [isValidCoords, setIsValidCoords] = useState(false);

  // Update parent component when location changes
  useEffect(() => {
    if (onLocationChange && selectedLocation) {
      onLocationChange(selectedLocation);
    }
  }, [selectedLocation, onLocationChange]);

  // Validate coordinates
  useEffect(() => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    const valid = !isNaN(lat) && !isNaN(lng) && 
                  lat >= -90 && lat <= 90 && 
                  lng >= -180 && lng <= 180;
    setIsValidCoords(valid);
  }, [manualCoords]);

  const handleLocationSelect = (lat, lng) => {
    if (mode === "select") {
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);
      setManualCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    }
  };

  const handleCenterChange = (lat, lng) => {
    setMapCenter([lat, lng]);
  };

  const handleManualCoordsChange = (field, value) => {
    setManualCoords(prev => ({ ...prev, [field]: value }));
  };

  const applyManualCoords = () => {
    if (isValidCoords) {
      const lat = parseFloat(manualCoords.lat);
      const lng = parseFloat(manualCoords.lng);
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);
      setMapCenter([lat, lng]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newLocation = { lat, lng };
          setSelectedLocation(newLocation);
          setMapCenter([lat, lng]);
          setManualCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to get your current location. Please enter coordinates manually or click on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const formatCoords = (lat, lng) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showControls && mode === "select" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="manual-lat">Latitude</Label>
            <Input
              id="manual-lat"
              type="number"
              step="any"
              value={manualCoords.lat}
              onChange={(e) => handleManualCoordsChange("lat", e.target.value)}
              placeholder="39.8283"
              className={!isValidCoords && manualCoords.lat ? "border-red-300" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-lng">Longitude</Label>
            <Input
              id="manual-lng"
              type="number"
              step="any"
              value={manualCoords.lng}
              onChange={(e) => handleManualCoordsChange("lng", e.target.value)}
              placeholder="-98.5795"
              className={!isValidCoords && manualCoords.lng ? "border-red-300" : ""}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button 
              onClick={applyManualCoords} 
              disabled={!isValidCoords}
              size="sm"
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Apply Coordinates
            </Button>
            <Button 
              onClick={getCurrentLocation} 
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use My Location
            </Button>
          </div>
          {!isValidCoords && (manualCoords.lat || manualCoords.lng) && (
            <div className="md:col-span-2 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Please enter valid coordinates (Lat: -90 to 90, Lng: -180 to 180)
            </div>
          )}
        </div>
      )}

      <div 
        className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={mapCenter}
          zoom={selectedLocation ? 10 : 4}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {mode === "select" && (
            <>
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              <MapCenterHandler center={mapCenter} onCenterChange={handleCenterChange} />
            </>
          )}

          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={selectedIcon}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-sm mb-1">Selected Location</div>
                  <div className="text-xs text-gray-600">
                    {formatCoords(selectedLocation.lat, selectedLocation.lng)}
                  </div>
                  {mode === "select" && (
                    <div className="mt-2 flex items-center text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Click to change location
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {selectedLocation && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Location: {formatCoords(selectedLocation.lat, selectedLocation.lng)}
            </span>
          </div>
          {mode === "select" && (
            <Button
              onClick={() => {
                setSelectedLocation(null);
                setManualCoords({ lat: "", lng: "" });
              }}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Clear Location
            </Button>
          )}
        </div>
      )}

      {mode === "select" && !selectedLocation && (
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-blue-800 font-medium">Click on the map to select a location</p>
          <p className="text-blue-600 text-sm mt-1">Or enter coordinates manually above</p>
        </div>
      )}
    </div>
  );
}
