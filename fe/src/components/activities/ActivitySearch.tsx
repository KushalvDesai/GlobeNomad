'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ActivitySearchProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
  value?: string;
}

export default function ActivitySearch({ 
  onSearch, 
  placeholder = "Search activities...",
  value = ""
}: ActivitySearchProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9AA0A6]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9AA0A6] hover:text-[#E6E8EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}