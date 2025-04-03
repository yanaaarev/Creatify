import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      {/* Pulsing Logo */}
      <img
        src="/images/logo.webp" // Update with the actual path
        alt="Creatify Logo"
        className="w-40 h-40 animate-pulse"
      />
      {/* Loading Text */}
      <p className="mt-4 text-lg font-semibold text-gray-600 animate-bounce">
        Loading...
      </p>
    </div>
  );
};

export default LoadingScreen;
