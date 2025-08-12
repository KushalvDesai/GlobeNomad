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

  const selectedCityData = cities.find(city => city.city === selectedCity);

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
        className="button w-full flex items-center justify-between px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--foreground)' }}>
            {selectedCity || "Select a city"}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 card rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={() => {
                onCityChange('');
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-opacity-10 hover:bg-white rounded-md transition-colors"
            >
              <span style={{ color: 'var(--foreground)' }}>All cities</span>
            </button>
            {cities.map((city) => (
              <button
                key={city.city}
                onClick={() => {
                  onCityChange(city.city);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-opacity-10 hover:bg-white rounded-md transition-colors ${
                  selectedCity === city.city ? 'bg-opacity-20' : ''
                }`}
                style={{
                  backgroundColor: selectedCity === city.city ? 'var(--accent-1)' : 'transparent'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{city.city}</div>
                    <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{city.country}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {city.totalActivities} activities
                    </div>
                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
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