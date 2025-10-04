
import React, { useState, useEffect } from "react";
import { Truck } from "@/api/entities";
import { Search, Filter, Sparkles, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import TruckCard from "../components/TruckCard";
import TruckFilters from "../components/TruckFilters";
import ImperialLogo from "../components/ImperialLogo";
import LoadingSpinner from "../components/LoadingSpinner";
import FadeIn from "../components/FadeIn";

export default function TruckGallery() {
  const [trucks, setTrucks] = useState([]);
  const [filteredTrucks, setFilteredTrucks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    make: "all",
    model: "all", // New filter
    year: "all", // New filter
    minPrice: "", // New filter
    maxPrice: "", // New filter
    condition: "all",
    fuelType: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadTrucks();
  }, []);

  useEffect(() => {
    const filterTrucks = () => {
      let filtered = trucks.filter(truck => {
        const matchesSearch = 
          (truck.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (truck.model?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (truck.shop_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (truck.location?.toLowerCase() || '').includes(searchQuery.toLowerCase()); // Added location to search

        const matchesMake = filters.make === "all" || truck.make === filters.make;
        const matchesModel = filters.model === "all" || truck.model === filters.model; // New
        const matchesYear = filters.year === "all" || (truck.year && truck.year.toString()) === filters.year; // New
        const matchesCondition = filters.condition === "all" || truck.condition === filters.condition;
        const matchesFuel = filters.fuelType === "all" || truck.fuel_type === filters.fuelType;
        
        // Custom price range filtering (updated logic)
        let matchesPrice = true;
        const price = truck.price || 0; // Ensure price is a number, default to 0
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
        
        if (filters.minPrice && price < minPrice) matchesPrice = false;
        if (filters.maxPrice && price > maxPrice) matchesPrice = false;

        return matchesSearch && matchesMake && matchesModel && matchesYear && matchesCondition && matchesFuel && matchesPrice;
      });

      setFilteredTrucks(filtered);
    };

    filterTrucks();
  }, [trucks, searchQuery, filters]);

  const loadTrucks = async () => {
    setIsLoading(true);
    const data = await Truck.filter({ status: "available" }, "-created_date");
    setTrucks(data);
    setIsLoading(false);
  };

  const uniqueMakes = [...new Set(trucks.map(truck => truck.make).filter(Boolean))]; // Still useful for general count/display
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'minPrice' || key === 'maxPrice') return value !== ""; // Count if minPrice or maxPrice is not empty
    return value !== "all"; // Count if other filters are not "all"
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <FadeIn delay={100}>
          <LoadingSpinner size="xl" text="Loading trucks..." />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-16" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <FadeIn delay={200}>
              <div className="mb-8">
                <ImperialLogo size="large" variant="full" className="justify-center" />
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Premium
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Semi Trucks
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={400}>
              <p className="text-xl md:text-2xl text-blue-100/80 mb-12 leading-relaxed max-w-3xl mx-auto">
                Discover premium semi trucks from Imperial Truck Sales. 
                Professional inspection and quality guaranteed.
              </p>
            </FadeIn>
            
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="Search by make, model, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-6 py-6 text-lg bg-white/95 backdrop-blur-sm border-0 text-gray-900 placeholder-gray-500 rounded-2xl shadow-2xl shadow-blue-900/20 focus:shadow-3xl focus:shadow-blue-500/20 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{trucks.length}</div>
                <div className="text-blue-200 text-sm font-medium">Available Trucks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{uniqueMakes.length}</div>
                <div className="text-blue-200 text-sm font-medium">Trusted Brands</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">5★</div>
                <div className="text-blue-200 text-sm font-medium">Quality Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Notice */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Want to List Your Truck?</h3>
            <p className="text-blue-700 mb-4">
              Contact Imperial Truck Sales to have your truck professionally inspected and listed on our marketplace.
            </p>
            <div className="flex justify-center">
              <a href="tel:916-642-5004" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300">
                Call (916) 642-5004
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">Available Trucks</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-semibold px-3 py-1">
              {filteredTrucks.length} results
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
             <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-full px-6 py-3 border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white min-w-[20px] h-5 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-12">
            <TruckFilters 
              filters={filters}
              setFilters={setFilters}
              trucks={trucks} // Pass all trucks to TruckFilters for dynamic options
            />
          </div>
        )}

        {filteredTrucks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No trucks found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Try adjusting your search terms or filters to find more trucks
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                // Clear all filters, including new ones
                setFilters({ make: "all", model: "all", year: "all", minPrice: "", maxPrice: "", condition: "all", fuelType: "all" });
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8 py-3 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTrucks.map((truck, index) => (
              <FadeIn delay={index * 100} key={truck.id}>
                <TruckCard truck={truck} />
              </FadeIn>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
