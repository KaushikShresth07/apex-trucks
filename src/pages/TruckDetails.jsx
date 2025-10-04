
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Truck } from "@/api/entities";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Phone, Mail, CheckCircle, Tag, Settings, Gauge, Fuel, Calendar, Car, BedDouble, Users, Trash2, Loader2, Shield, CheckCircle2, Edit, Save, X } from "lucide-react";
import LocationMap from "@/components/LocationMap";

export default function TruckDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isEditingInspection, setIsEditingInspection] = useState(false);
  const [inspectionData, setInspectionData] = useState({
    imperial_inspected: false,
    inspection_date: "",
    inspection_notes: ""
  });
  const [backLinkInfo, setBackLinkInfo] = useState({ url: createPageUrl("TruckGallery"), text: "Back to Gallery" });

  useEffect(() => {
    const fetchTruckAndUser = async () => {
      setIsLoading(true);
      
      // Fetch user data
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        // Not logged in, or public user - treat as null
        setCurrentUser(null);
        console.warn("User not logged in or session expired.");
      }

      // Fetch truck data and check for 'from' parameter
      const params = new URLSearchParams(location.search);
      const truckId = params.get("id");
      const from = params.get("from");

      if (from === 'dashboard') {
        setBackLinkInfo({ url: createPageUrl("AdminDashboard"), text: "Back to Dashboard" });
      } else {
        setBackLinkInfo({ url: createPageUrl("TruckGallery"), text: "Back to Gallery" });
      }

      if (truckId) {
        try {
          const data = await Truck.get(truckId);
          setTruck(data);
          setInspectionData({
            imperial_inspected: data.imperial_inspected || false,
            inspection_date: data.imperial_inspected && data.inspection_date ? new Date(data.inspection_date).toISOString().split('T')[0] : "", // Format for date input
            inspection_notes: data.inspection_notes || ""
          });
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]);
          }
        } catch (error) {
          console.error("Failed to fetch truck details:", error);
          setTruck(null); // Explicitly set to null if fetch fails
        }
      } else {
        setTruck(null); // No truck ID provided
      }
      setIsLoading(false);
    };
    fetchTruckAndUser();
  }, [location.search]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await Truck.delete(truck.id);
        alert("Truck listing deleted successfully.");
        navigate(createPageUrl("TruckGallery"));
      } catch (error) {
        console.error("Failed to delete truck:", error);
        alert("An error occurred while deleting the listing. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  const handleInspectionUpdate = async () => {
    try {
      const updatedData = {
        imperial_inspected: inspectionData.imperial_inspected,
        inspection_date: inspectionData.imperial_inspected && inspectionData.inspection_date ? new Date(inspectionData.inspection_date).toISOString() : null,
        inspection_notes: inspectionData.imperial_inspected ? inspectionData.inspection_notes : null
      };
      
      const updatedTruck = await Truck.update(truck.id, updatedData);
      setTruck(prev => ({ ...prev, ...updatedTruck })); // Use the returned updatedTruck to ensure consistency
      setInspectionData(prev => ({
        ...prev,
        imperial_inspected: updatedTruck.imperial_inspected,
        inspection_date: updatedTruck.imperial_inspected && updatedTruck.inspection_date ? new Date(updatedTruck.inspection_date).toISOString().split('T')[0] : "",
        inspection_notes: updatedTruck.inspection_notes || ""
      }));
      setIsEditingInspection(false);
      alert("Inspection status updated successfully!");
    } catch (error) {
      console.error("Failed to update inspection status:", error);
      alert("Error updating inspection status. Please try again.");
    }
  };

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

  const SpecItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100/80">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse grid md:grid-cols-2 gap-12">
          <div>
            <div className="aspect-video bg-gray-200 rounded-3xl mb-4"></div>
            <div className="flex gap-2">
              <div className="w-24 h-16 bg-gray-200 rounded-xl"></div>
              <div className="w-24 h-16 bg-gray-200 rounded-xl"></div>
              <div className="w-24 h-16 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
          <div>
            <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded-lg w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-5/6"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Truck not found</h2>
        <Link to={createPageUrl("TruckGallery")}>
          <Button>Back to Gallery</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-8">
          <Link to={backLinkInfo.url}>
            <Button variant="outline" className="rounded-full px-6 py-3 border-2 flex items-center gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              {backLinkInfo.text}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-3">
            <div className="sticky top-28">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden mb-4 shadow-2xl shadow-gray-200">
                {!imageError && mainImage ? (
                  <img src={mainImage} alt="Main truck view" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="flex gap-4">
                {truck.images?.map((img, index) => (
                  <button key={index} onClick={() => { setMainImage(img); setImageError(false); }} className={`w-24 h-16 rounded-xl overflow-hidden border-4 transition-all duration-200 ${mainImage === img ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-blue-300'}`}>
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Truck Details */}
          <div className="lg:col-span-2">
            {/* Company Inspection Banner */}
            {truck.imperial_inspected && (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 fill-white" />
                      Company Inspected & Approved
                    </h3>
                    <p className="text-blue-100 mt-1">This truck has been thoroughly inspected and approved by Truck Sales Co</p>
                    {truck.inspection_date && (
                      <p className="text-blue-200 text-sm mt-2">Inspected on: {new Date(truck.inspection_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                {truck.inspection_notes && (
                  <div className="mt-4 p-4 bg-white/10 rounded-xl">
                    <p className="text-blue-100 text-sm leading-relaxed">{truck.inspection_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Tools */}
            {currentUser?.role === 'admin' && (
              <div className="mb-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Admin Tools</h3>
                  <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(createPageUrl(`AddTruck?id=${truck.id}`))}
                        className="flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Listing
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-2">Inspection Status</h4>
                {isEditingInspection ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="imperial_inspected"
                        checked={inspectionData.imperial_inspected}
                        onChange={(e) => setInspectionData(prev => ({ ...prev, imperial_inspected: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="imperial_inspected" className="font-medium text-gray-900">
                        Mark as Company Inspected & Approved
                      </label>
                    </div>
                    
                    {inspectionData.imperial_inspected && (
                      <>
                        <div>
                          <label htmlFor="inspection_date" className="block text-sm font-medium text-gray-700 mb-2">Inspection Date</label>
                          <input
                            type="date"
                            id="inspection_date"
                            value={inspectionData.inspection_date}
                            onChange={(e) => setInspectionData(prev => ({ ...prev, inspection_date: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="inspection_notes" className="block text-sm font-medium text-gray-700 mb-2">Inspection Notes</label>
                          <textarea
                            id="inspection_notes"
                            value={inspectionData.inspection_notes}
                            onChange={(e) => setInspectionData(prev => ({ ...prev, inspection_notes: e.target.value }))}
                            placeholder="Add notes about the inspection..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2">
                        <Button
                          onClick={handleInspectionUpdate}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save Status
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditingInspection(false)}
                            className="flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Cancel
                        </Button>
                    </div>
                  </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-3 p-2 rounded-lg text-sm ${truck.imperial_inspected ? 'text-blue-800' : 'text-gray-600'}`}>
                            {truck.imperial_inspected ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Approved</span>
                            </>
                            ) : (
                            <>
                                <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                                <span>Not Inspected</span>
                            </>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditingInspection(true)}
                        >
                            Change Status
                        </Button>
                  </div>
                )}
              </div>
            )}

            {/* Header */}
            <div className="pb-6 border-b border-gray-100 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">{truck.year} {truck.make} {truck.model}</h1>
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{truck.shop_name} • {truck.location}</span>
              </div>
            </div>
            
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
              {formatPrice(truck.price)}
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <SpecItem icon={Gauge} label="Mileage" value={`${formatMileage(truck.mileage)} mi`} />
                <SpecItem icon={Fuel} label="Fuel Type" value={truck.fuel_type?.replace('_', ' ')} />
                <SpecItem icon={Settings} label="Transmission" value={truck.transmission?.replace('_', ' ')} />
                <SpecItem icon={Car} label="Axle Config" value={truck.axle_configuration || 'N/A'} />
                <SpecItem icon={Calendar} label="Year" value={truck.year} />
                <SpecItem icon={Tag} label="Condition" value={truck.condition} />
                <SpecItem icon={BedDouble} label="Cab Type" value={truck.cab_type?.replace('_', ' ')} />
                <SpecItem icon={Users} label="Engine" value={truck.engine || 'N/A'} />
              </div>
              
              {/* Additional specs if available */}
              {(truck.horsepower || truck.torque || truck.gvwr) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {truck.horsepower && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{truck.horsepower}</div>
                      <div className="text-sm text-gray-600">Horsepower</div>
                    </div>
                  )}
                  {truck.torque && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="text-2xl font-bold text-green-600">{truck.torque}</div>
                      <div className="text-sm text-gray-600">lb-ft Torque</div>
                    </div>
                  )}
                  {truck.gvwr && (
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div className="text-2xl font-bold text-purple-600">{truck.gvwr?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">GVWR (lbs)</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Features */}
            {truck.features?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Features & Options</h3>
                <div className="flex flex-wrap gap-3">
                  {truck.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1 text-sm bg-blue-50 border-blue-200 text-blue-700 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Dealer's Description</h3>
              <p className="text-gray-600 leading-relaxed text-base">{truck.description || "No description provided."}</p>
            </div>

            {/* Location Map */}
            {truck.latitude && truck.longitude && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Location</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <LocationMap
                    initialLocation={{ lat: truck.latitude, lng: truck.longitude }}
                    mode="view"
                    height="400px"
                    showControls={false}
                    zoom={12}
                  />
                </div>
                {truck.location && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {truck.location}
                  </p>
                )}
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested? Contact the Dealer</h3>
              <div className="space-y-4">
                 <a href={`tel:${truck.contact_phone}`} className="w-full">
                    <Button size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-green-500/20 hover:shadow-xl group">
                        <Phone className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                        Call {truck.contact_phone}
                    </Button>
                 </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
