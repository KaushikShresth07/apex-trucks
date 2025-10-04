

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Truck, Plus, Grid3X3, LogIn, UserCheck, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogin = () => {
    // Navigate to login page and store current location for redirect
    window.location.href = "/login";
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      setCurrentUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Navigation */}
            <Link to={createPageUrl("TruckGallery")}>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-blue-900 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Imperial Truck Sales
              </span>
            </Link>

            {/* Navigation & Global Search */}
            {/* Grouped for better spacing control using justify-between on the parent div */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                <Link 
                  to={createPageUrl("TruckGallery")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    location.pathname === createPageUrl("TruckGallery")
                      ? "bg-blue-100 text-blue-700 shadow-md" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Browse Trucks
                </Link>
                
                {/* Admin-only navigation */}
                {isAdmin && (
                  <>
                    <Link 
                      to={createPageUrl("AddTruck")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        location.pathname === createPageUrl("AddTruck")
                          ? "bg-blue-100 text-blue-700 shadow-md" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      List Truck
                    </Link>
                    <Link 
                      to={createPageUrl("AdminDashboard")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        location.pathname === createPageUrl("AdminDashboard")
                          ? "bg-blue-100 text-blue-700 shadow-md" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <BarChart2 className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>
              {/* Global Search/Filter Input - Removed */}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 animate-pulse rounded-full"></div>
              ) : currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{currentUser.role} Access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <Link 
                        to={createPageUrl("AddTruck")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 transform hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">List Truck</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
                        <UserCheck className="w-4 h-4" />
                        <span className="hidden sm:inline">Customer</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="rounded-full px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Admin? Sign in to manage trucks
                  </p>
                  <Button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center gap-2 transform hover:scale-105"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Admin Login</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-b border-white/60 bg-white/95 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Link 
                to={createPageUrl("TruckGallery")}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  location.pathname === createPageUrl("TruckGallery")
                    ? "text-blue-600 font-semibold" 
                    : "text-gray-600"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Browse
              </Link>
              
              {isAdmin && (
                <>
                <Link 
                  to={createPageUrl("AddTruck")}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    location.pathname === createPageUrl("AddTruck")
                      ? "text-blue-600 font-semibold" 
                      : "text-gray-600"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  List
                </Link>
                <Link 
                  to={createPageUrl("AdminDashboard")}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    location.pathname === createPageUrl("AdminDashboard")
                      ? "text-blue-600 font-semibold" 
                      : "text-gray-600"
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Dashboard
                </Link>
                </>
              )}
            </div>
            
            {currentUser && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{currentUser.full_name}</span>
                <span className="text-blue-600 font-medium capitalize">({currentUser.role})</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

