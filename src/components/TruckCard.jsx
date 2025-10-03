
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Phone, Mail, Eye, Fuel, Settings, Gauge, Heart, ArrowRight, Calendar, Award, CheckCircle2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TruckCard({ truck }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('en-US').format(mileage);
  };

  const conditionColors = {
    new: "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
    excellent: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
    good: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    fair: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
  };

  return (
    <Link 
      to={createPageUrl(`TruckDetails?id=${truck.id}`)}
      className="block group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100/50 relative"
    >
      {/* Company Inspection Badge */}
      {truck.imperial_inspected && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border-2 border-white">
          <CheckCircle2 className="w-4 h-4 fill-white" />
          <span>COMPANY INSPECTED</span>
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
        {truck.images && truck.images.length > 0 && !imageError ? (
          <img
            src={truck.images[0]}
            alt={`${truck.year} ${truck.make} ${truck.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-10 h-10 text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No Image Available</p>
            </div>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 group/heart"
        >
          <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-600 group-hover/heart:text-red-500'}`} />
        </button>

        {/* Condition Badge */}
        <div className="absolute top-4 left-4" style={{ marginTop: truck.imperial_inspected ? '2.5rem' : '0' }}>
          <Badge className={`${conditionColors[truck.condition]} border-0 font-semibold shadow-lg px-3 py-1`}>
            <Award className="w-3 h-3 mr-1" />
            {truck.condition.charAt(0).toUpperCase() + truck.condition.slice(1)}
          </Badge>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-2xl font-bold text-lg shadow-xl border border-white/50">
            {formatPrice(truck.price)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Company Inspection Status in content area */}
        {truck.imperial_inspected && (
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-blue-800">Company Inspected & Approved</div>
                <div className="text-xs text-blue-600">Quality guaranteed by Truck Sales Co</div>
              </div>
            </div>
          </div>
        )}

        {/* Title & Location */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {truck.year} {truck.make} {truck.model}
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">{truck.shop_name}</span>
            {truck.location && (
              <>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {truck.location}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {truck.mileage && (
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Gauge className="w-4 h-4 text-gray-600 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Mileage</div>
              <div className="font-semibold text-sm">{formatMileage(truck.mileage)}</div>
            </div>
          )}
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Fuel className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Fuel</div>
            <div className="font-semibold text-sm capitalize">{truck.fuel_type}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Settings className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Axles</div>
            <div className="font-semibold text-sm">{truck.axle_configuration || 'N/A'}</div>
          </div>
        </div>

        {/* Features */}
        {truck.features && truck.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {truck.features.slice(0, 3).map((feature, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors duration-200">
                  {feature}
                </Badge>
              ))}
              {truck.features.length > 3 && (
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                  +{truck.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description Preview */}
        {truck.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {truck.description.length > 100 ? `${truck.description.substring(0, 100)}...` : truck.description}
          </p>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Contact Options */}
          <div className="flex gap-2">
            {truck.contact_phone && (
              <a
                href={`tel:${truck.contact_phone}`}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${truck.contact_phone}`}}
                className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {truck.contact_email && (
              <a
                href={`mailto:${truck.contact_email}`}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${truck.contact_email}`}}
                className="w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
          
          {/* View Details Button */}
          <div 
            className="bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group/btn flex items-center gap-2"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
}
