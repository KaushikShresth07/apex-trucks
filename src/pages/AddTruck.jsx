
import React, { useState, useEffect } from "react";
import { Truck } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Plus, ArrowLeft, Check, Shield, LogIn, Lock, MapPin, Loader2, CheckCircle, Save } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AddTruck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [truckId, setTruckId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "",
    condition: "good",
    fuel_type: "diesel",
    transmission: "manual",
    engine: "",
    horsepower: "",
    torque: "",
    axle_configuration: "6x4",
    cab_type: "sleeper_cab",
    sleeper_size: "",
    wheelbase: "",
    gvwr: "",
    exterior_color: "",
    interior_color: "",
    imperial_inspected: false,
    inspection_date: "",
    inspection_notes: "",
    features: [],
    description: "",
    shop_name: "Truck Sales Co",
    contact_phone: "",
    contact_email: "",
    location: "",
    latitude: null,
    longitude: null,
    vin: "",
    status: "available",
  });

  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([]);
  const [newFeature, setNewFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  useEffect(() => {
    const fetchUserAndTruck = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Redirect non-admin users immediately
        if (!user || user.role !== 'admin') {
          navigate(createPageUrl("TruckGallery"));
          return;
        }
        
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        if (id) {
          setIsEditMode(true);
          setTruckId(id);
          const truckData = await Truck.get(id);
          setFormData({
            ...truckData,
            // Ensure numbers are not null for controlled inputs, default to empty string or current year
            year: truckData.year || new Date().getFullYear(),
            price: truckData.price !== null ? truckData.price : "",
            mileage: truckData.mileage !== null ? truckData.mileage : "",
            horsepower: truckData.horsepower !== null ? truckData.horsepower : "",
            torque: truckData.torque !== null ? truckData.torque : "",
            wheelbase: truckData.wheelbase !== null ? truckData.wheelbase : "",
            gvwr: truckData.gvwr !== null ? truckData.gvwr : "",
            // Format date for input type="date"
            inspection_date: truckData.inspection_date ? new Date(truckData.inspection_date).toISOString().split('T')[0] : "",
            features: truckData.features || [],
            // Ensure status defaults if not present
            status: truckData.status || "available",
          });
          setImages(truckData.images || []);
          if (truckData.latitude && truckData.longitude) {
            setGeocodeSuccess(true);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user or truck:", e);
        // If fetching user or truck fails, and it's not an admin, redirect
        navigate(createPageUrl("TruckGallery"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndTruck();
  }, [location.search, navigate]);

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'location') {
      setGeocodeSuccess(false);
      setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
    }
  };

  const handleGeocodeLocation = async () => {
    if (!formData.location) {
      alert("Please enter a location first.");
      return;
    }
    setIsGeocoding(true);
    setGeocodeSuccess(false);
    try {
      const response = await InvokeLLM({
        prompt: `Geocode this location and provide only the latitude and longitude: "${formData.location}"`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            latitude: { type: "number" },
            longitude: { type: "number" }
          },
          required: ["latitude", "longitude"]
        }
      });
      if (response.latitude && response.longitude) {
        setFormData(prev => ({
          ...prev,
          latitude: response.latitude,
          longitude: response.longitude
        }));
        setGeocodeSuccess(true);
      } else {
        throw new Error("Invalid response from geocoding service.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Could not find coordinates for this location. Please try a different format (e.g., 'City, State, Country').");
      setFormData(prev => ({ ...prev, latitude: null, longitude: null }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleImageUpload = async (files) => {
    const fileArray = Array.from(files);
    setUploadingImages(prev => [...prev, ...fileArray]);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const result = await UploadFile({ file });
        return result.file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImages([]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.location && (!formData.latitude || !formData.longitude) && !geocodeSuccess) {
      if (!window.confirm("Location has not been verified on the map. Do you want to continue anyway?")) {
        return;
      }
    }
    setIsSubmitting(true);

    const dataToSubmit = {
      ...formData,
      images,
      year: parseInt(formData.year),
      price: parseFloat(formData.price),
      mileage: parseInt(formData.mileage) || 0,
      horsepower: parseInt(formData.horsepower) || null,
      torque: parseInt(formData.torque) || null,
      wheelbase: parseInt(formData.wheelbase) || null,
      gvwr: parseInt(formData.gvwr) || null,
    };

    try {
      if (isEditMode) {
        await Truck.update(truckId, dataToSubmit);
        navigate(createPageUrl(`TruckDetails?id=${truckId}`));
      } else {
        await Truck.create(dataToSubmit);
        navigate(createPageUrl("TruckGallery"));
      }
    } catch (error) {
      console.error("Error submitting truck:", error);
      alert("An error occurred. Please check the form and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for non-authenticated users
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Only Truck Sales Co administrators can list or edit trucks.
            If you're an admin, please sign in to continue.
          </p>
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <LogIn className="w-5 h-5" />
              Admin Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("TruckGallery"))}
              className="w-full py-3 rounded-xl font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse Trucks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users (this block should ideally not be reached if redirect in useEffect works)
  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-3xl shadow-2xl border border-red-100">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Hi {currentUser.full_name}! Only administrators can list or edit trucks.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("TruckGallery"))}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Trucks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(isEditMode ? createPageUrl(`TruckDetails?id=${truckId}`) : createPageUrl("TruckGallery"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-light text-gray-900 mb-2">{isEditMode ? "Edit Truck Listing" : "List New Truck"}</h1>
            <p className="text-gray-600">{isEditMode ? "Update the details for this truck" : "Add a new truck to the Truck Sales Co marketplace"}</p>
          </div>
        </div>

        {/* Admin Badge */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900">Truck Sales Co Administrator</h3>
              <p className="text-blue-700 text-sm">Signed in as {currentUser.full_name}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Upload */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload truck photos</p>
                    <p className="text-gray-600">Add multiple high-quality images to showcase the truck</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageUrl, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Truck photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => handleInputChange("make", e.target.value)}
                    placeholder="Peterbilt, Kenworth, Freightliner..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    placeholder="579, W900, Cascadia..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="75000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage</Label>
                  <Input
                    id="mileage"
                    type="number"
                    min="0"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    placeholder="500000"
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label htmlFor="status">Listing Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engine & Drivetrain Specifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Engine & Drivetrain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Select value={formData.fuel_type} onValueChange={(value) => handleInputChange("fuel_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="natural_gas">Natural Gas</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(value) => handleInputChange("transmission", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="automated_manual">Automated Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="engine">Engine</Label>
                  <Input
                    id="engine"
                    value={formData.engine}
                    onChange={(e) => handleInputChange("engine", e.target.value)}
                    placeholder="Cummins X15, Detroit DD15..."
                  />
                </div>
                <div>
                  <Label htmlFor="axle_configuration">Axle Configuration</Label>
                  <Select value={formData.axle_configuration} onValueChange={(value) => handleInputChange("axle_configuration", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4x2">4x2</SelectItem>
                      <SelectItem value="6x2">6x2</SelectItem>
                      <SelectItem value="6x4">6x4</SelectItem>
                      <SelectItem value="8x4">8x4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="horsepower">Horsepower</Label>
                  <Input
                    id="horsepower"
                    type="number"
                    min="0"
                    value={formData.horsepower}
                    onChange={(e) => handleInputChange("horsepower", e.target.value)}
                    placeholder="450"
                  />
                </div>
                <div>
                  <Label htmlFor="torque">Torque (lb-ft)</Label>
                  <Input
                    id="torque"
                    type="number"
                    min="0"
                    value={formData.torque}
                    onChange={(e) => handleInputChange("torque", e.target.value)}
                    placeholder="1650"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cab & Physical Specs */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Cab & Physical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cab_type">Cab Type</Label>
                  <Select value={formData.cab_type} onValueChange={(value) => handleInputChange("cab_type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day_cab">Day Cab</SelectItem>
                      <SelectItem value="sleeper_cab">Sleeper Cab</SelectItem>
                      <SelectItem value="extended_sleeper">Extended Sleeper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sleeper_size">Sleeper Size</Label>
                  <Input
                    id="sleeper_size"
                    value={formData.sleeper_size}
                    onChange={(e) => handleInputChange("sleeper_size", e.target.value)}
                    placeholder="72 inch, 63 inch..."
                  />
                </div>
                <div>
                  <Label htmlFor="wheelbase">Wheelbase (inches)</Label>
                  <Input
                    id="wheelbase"
                    type="number"
                    min="0"
                    value={formData.wheelbase}
                    onChange={(e) => handleInputChange("wheelbase", e.target.value)}
                    placeholder="244"
                  />
                </div>
                <div>
                  <Label htmlFor="gvwr">GVWR (lbs)</Label>
                  <Input
                    id="gvwr"
                    type="number"
                    min="0"
                    value={formData.gvwr}
                    onChange={(e) => handleInputChange("gvwr", e.target.value)}
                    placeholder="80000"
                  />
                </div>
                <div>
                  <Label htmlFor="exterior_color">Exterior Color</Label>
                  <Input
                    id="exterior_color"
                    value={formData.exterior_color}
                    onChange={(e) => handleInputChange("exterior_color", e.target.value)}
                    placeholder="Bright Red, Arctic White..."
                  />
                </div>
                <div>
                  <Label htmlFor="interior_color">Interior Color</Label>
                  <Input
                    id="interior_color"
                    value={formData.interior_color}
                    onChange={(e) => handleInputChange("interior_color", e.target.value)}
                    placeholder="Black, Gray..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imperial Inspection */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Company Inspection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="imperial_inspected"
                    checked={formData.imperial_inspected}
                    onChange={(e) => handleInputChange("imperial_inspected", e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="imperial_inspected" className="font-medium text-gray-900">
                    This truck has been inspected and approved by Truck Sales Co
                  </label>
                </div>
                
                {formData.imperial_inspected && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-4 bg-blue-50 rounded-xl">
                    <div>
                      <Label htmlFor="inspection_date">Inspection Date</Label>
                      <Input
                        id="inspection_date"
                        type="date"
                        value={formData.inspection_date}
                        onChange={(e) => handleInputChange("inspection_date", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="inspection_notes">Inspection Notes</Label>
                      <Textarea
                        id="inspection_notes"
                        value={formData.inspection_notes}
                        onChange={(e) => handleInputChange("inspection_notes", e.target.value)}
                        placeholder="Add notes about the inspection, any issues found, or quality highlights..."
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Features & Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature (e.g., APU, Custom Exhaust)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {feature}
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the truck, its history, maintenance, and any other relevant details..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Contact & Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="shop_name">Shop/Dealer Name</Label>
                  <Input
                    id="shop_name"
                    value={formData.shop_name}
                    onChange={(e) => handleInputChange("shop_name", e.target.value)}
                    placeholder="Truck Sales Co"
                    required
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange("contact_email", e.target.value)}
                    placeholder="contact@trucksales.com"
                  />
                </div>
                 <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                    placeholder="1FTFW1ET5DFC12345"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, State, Country"
                    />
                    <Button type="button" variant="outline" onClick={handleGeocodeLocation} disabled={isGeocoding} className="w-48">
                      {isGeocoding ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <MapPin className="w-4 h-4 mr-2" />
                      )}
                      Find on Map
                    </Button>
                  </div>
                   {geocodeSuccess && (
                      <div className="mt-2 flex items-center text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Location verified on map!
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEditMode ? createPageUrl(`TruckDetails?id=${truckId}`) : createPageUrl("TruckGallery"))}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 min-w-36"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  {isEditMode ? "Saving..." : "Publishing..."}
                </>
              ) : (
                <>
                  {isEditMode ? <Save className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  {isEditMode ? "Save Changes" : "List Truck"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
