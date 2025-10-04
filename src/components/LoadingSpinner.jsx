import React from 'react';

const LoadingSpinner = ({ size = "medium", className = "", text = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-200 animate-spin`}></div>
        {/* Inner ring */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-600 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
