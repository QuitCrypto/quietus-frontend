"use client";

import React from "react";

export function SpaceBarge() {
  return (
    <div className="space-barge-container absolute inset-0 flex items-center justify-center w-full h-full">
      {/* 8-bit Space Barge Ship */}
      <div className="space-barge flex items-center justify-center">
        <div className="w-[150px] h-[110px] flex flex-col relative">
          {/* Ship Body */}
          <div className="w-full h-[55px] bg-gray-700 border-2 border-gray-800 mt-auto pixelated relative">
            {/* Windows */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-300 border-1 border-cyan-100 pixelated"></div>
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-cyan-300 border-1 border-cyan-100 pixelated"></div>
            
            {/* Ship Body Details */}
            <div className="absolute bottom-0 inset-x-0 h-3 bg-gray-800 pixelated"></div>
            <div className="absolute top-2 left-[30px] right-[30px] h-2 bg-gray-800 pixelated"></div>
          </div>
          
          {/* Ship Cockpit */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50px] h-[30px] bg-gray-600 border-2 border-gray-800 rounded-t-xl pixelated">
            <div className="absolute bottom-2 left-0 right-0 mx-auto w-[30px] h-[10px] bg-cyan-300 border-1 border-cyan-100 pixelated"></div>
          </div>
          
          {/* Thrusters */}
          <div className="absolute bottom-0 left-[20px] w-[20px] h-[8px] bg-gray-800 pixelated"></div>
          <div className="absolute bottom-0 right-[20px] w-[20px] h-[8px] bg-gray-800 pixelated"></div>
          
          {/* Thruster Flames - Animated */}
          <div className="absolute -bottom-2 left-[24px] w-[12px] h-[8px] bg-orange-500 animate-pulse pixelated"></div>
          <div className="absolute -bottom-2 right-[24px] w-[12px] h-[8px] bg-orange-500 animate-pulse pixelated"></div>
          
          {/* Ship Wing Left */}
          <div className="absolute left-0 top-1/2 w-[20px] h-[40px] bg-gray-600 border-2 border-gray-800 pixelated"></div>
          
          {/* Ship Wing Right */}
          <div className="absolute right-0 top-1/2 w-[20px] h-[40px] bg-gray-600 border-2 border-gray-800 pixelated"></div>
        </div>
      </div>
    </div>
  );
}

export default SpaceBarge; 