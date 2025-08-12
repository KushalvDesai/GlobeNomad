'use client';

import { CityActivityStats } from '@/graphql/types';
import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CitySelectorProps {
  cities: CityActivityStats[];
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export default function CitySelector({ cities, selectedCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#14141c] transition-colors"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-[#9AA0A6]" />
          <span className="text-[#E6E8EB]">
            {selectedCity || "Select a city"}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#9AA0A6] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f17] border border-[#2a2a35] rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onCityChange('');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-[#14141c] rounded-md transition-colors"
            >
              <span className="text-[#E6E8EB]">All cities</span>
            </button>
            {cities.map((city) => (
              <button
                key={city.city}
                onClick={() => {
                  onCityChange(city.city);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-[#14141c] rounded-md transition-colors ${
                  selectedCity === city.city ? 'bg-[#27C3FF]/20 border border-[#27C3FF]/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#E6E8EB]">{city.city}</div>
                    <div className="text-sm text-[#9AA0A6]">{city.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#E6E8EB]">
                      {city.totalActivities} activities
                    </div>
                    <div className="text-xs text-[#9AA0A6]">
                      from {formatPrice(city.averagePrice, city.currency)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}