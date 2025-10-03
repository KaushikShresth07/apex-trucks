import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Car, Calendar, DollarSign, Settings } from "lucide-react";

export default function TruckFilters({ filters, setFilters, trucks }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      make: "all",
      model: "all",
      year: "all",
      minPrice: "",
      maxPrice: "",
      condition: "all",
      fuelType: "all"
    });
  };

  // Extract unique values from trucks
  const uniqueMakes = [...new Set(trucks.map(truck => truck.make).filter(Boolean))].sort();
  const uniqueModels = [...new Set(trucks.map(truck => truck.model).filter(Boolean))].sort();
  const uniqueYears = [...new Set(trucks.map(truck => truck.year).filter(Boolean))].sort((a, b) => b - a);

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'minPrice' || key === 'maxPrice') return value !== "";
    return value !== "all";
  }).length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Filter Results</h3>
            <p className="text-gray-500 text-sm">Narrow down your search</p>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="rounded-full px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Make Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Car className="w-4 h-4 text-blue-500" />
            Make
          </label>
          <Select value={filters.make} onValueChange={(value) => handleFilterChange("make", value)}>
            <SelectTrigger className="rounded-xl border-2 hover:border-blue-300 transition-colors duration-200">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {uniqueMakes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Settings className="w-4 h-4 text-green-500" />
            Model
          </label>
          <Select value={filters.model} onValueChange={(value) => handleFilterChange("model", value)}>
            <SelectTrigger className="rounded-xl border-2 hover:border-green-300 transition-colors duration-200">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {uniqueModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="w-4 h-4 text-purple-500" />
            Year
          </label>
          <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
            <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 transition-colors duration-200">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Price */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Min Price
          </label>
          <Input
            type="number"
            placeholder="$0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="rounded-xl border-2 hover:border-emerald-300 focus:border-emerald-500 transition-colors duration-200"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Max Price
          </label>
          <Input
            type="number"
            placeholder="No limit"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="rounded-xl border-2 hover:border-emerald-300 focus:border-emerald-500 transition-colors duration-200"
          />
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Car className="w-4 h-4 text-orange-500" />
            Condition
          </label>
          <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
            <SelectTrigger className="rounded-xl border-2 hover:border-orange-300 transition-colors duration-200">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <span className="font-medium">Active filters:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFiltersCount} active
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if ((key === 'minPrice' || key === 'maxPrice') && value === "") return null;
              if (key !== 'minPrice' && key !== 'maxPrice' && value === "all") return null;
              
              let displayValue = value;
              let displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              
              if (key === 'minPrice') {
                displayKey = 'Min Price';
                displayValue = `$${parseInt(value).toLocaleString()}`;
              } else if (key === 'maxPrice') {
                displayKey = 'Max Price';
                displayValue = `$${parseInt(value).toLocaleString()}`;
              }

              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 group"
                  onClick={() => handleFilterChange(key, key === 'minPrice' || key === 'maxPrice' ? "" : "all")}
                >
                  <span className="capitalize">{displayKey}:</span>
                  <span className="ml-1 font-semibold">{displayValue}</span>
                  <X className="w-3 h-3 ml-1 group-hover:text-red-500 transition-colors duration-200" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}