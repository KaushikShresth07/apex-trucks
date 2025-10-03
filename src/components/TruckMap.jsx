
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});


const formatPrice = (price) => {
  if (price == null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function TruckMap({ trucks }) {
  const trucksWithLocation = trucks.filter(
    (truck) => truck.latitude != null && truck.longitude != null
  );

  if (trucksWithLocation.length === 0) {
    return (
        <div className="h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center text-center p-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800">No trucks with location data</h3>
                <p className="text-gray-600 mt-2">Trucks with verified locations will appear on this map.</p>
            </div>
        </div>
    );
  }

  // Calculate center of map
  const latitudes = trucksWithLocation.map(t => t.latitude);
  const longitudes = trucksWithLocation.map(t => t.longitude);
  const centerLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
  const centerLon = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white">
      <MapContainer 
        center={[centerLat, centerLon]} 
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trucksWithLocation.map((truck) => (
          <Marker key={truck.id} position={[truck.latitude, truck.longitude]}>
            <Popup>
              <div className="w-64">
                <div className="aspect-video rounded-lg overflow-hidden mb-2">
                    <img src={truck.images?.[0] || 'https://via.placeholder.com/300x200'} alt={`${truck.year} ${truck.make} ${truck.model}`} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-base leading-tight mb-1">{`${truck.year} ${truck.make} ${truck.model}`}</h3>
                <p className="text-blue-600 font-semibold text-lg mb-2">{formatPrice(truck.price)}</p>
                <Link to={createPageUrl(`TruckDetails?id=${truck.id}`)}>
                    <Button size="sm" className="w-full">View Details</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
