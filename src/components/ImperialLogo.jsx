import React from 'react';

const ImperialLogo = ({ size = "medium", variant = "full", className = "" }) => {
  // Define size variants
  const sizeClasses = {
    small: "w-20 h-6",
    medium: "w-32 h-10", 
    large: "w-48 h-14"
  };

  const iconSizes = {
    small: { circle: 16, icon: "8", text: "10" },
    medium: { circle: 20, icon: "10", text: "12" },
    large: { circle: 28, icon: "12", text: "16" }
  };

  const currentSize = iconSizes[size] || iconSizes.medium;
  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`flex items-center ${className}`}>
      <svg 
        className={sizeClass} 
        viewBox="0 0 200 60" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="30" cy="30" r="28" fill="#1e40af" stroke="#3b82f6" strokeWidth="2"/>
        
        {/* Truck Icon */}
        <g transform="translate(18, 18)">
          {/* Truck Body */}
          <rect x="2" y="8" width="20" height="8" fill="white" rx="1"/>
          <rect x="4" y="2" width="16" height="6" fill="white" rx="1"/>
          
          {/* Wheels */}
          <circle cx="6" cy="16" r="2" fill="white"/>
          <circle cx="18" cy="16" r="2" fill="white"/>
          
          {/* Trailer */}
          <rect x="22" y="11" width="12" height="4" fill="white"/>
          <circle cx="30" cy="15.5" r="1.5" fill="white"/>
        </g>
        
        {variant === "full" && (
          <>
            {/* Imperial Text */}
            <text x="70" y="25" fontFamily="Arial, sans-serif" fontSize={currentSize.text * 1.4} fontWeight="bold" fill="#1e40af">IMPERIAL</text>
            <text x="70" y="42" fontFamily="Arial, sans-serif" fontSize={currentSize.text * 1.1} fontWeight="normal" fill="#64748b">TRUCK SALES</text>
            
            {/* Decorative Line */}
            <line x1="70" y1="28" x2="160" y2="28" stroke="#3b82f6" strokeWidth="2"/>
            
            {/* Tagline */}
            <text x="70" y="50" fontFamily="Arial, sans-serif" fontSize={currentSize.text * 0.7} fontWeight="normal" fill="#94a3b8">PREMIUM QUALITY • PROFESSIONAL SERVICE</text>
          </>
        )}
      </svg>
    </div>
  );
};

export default ImperialLogo;
