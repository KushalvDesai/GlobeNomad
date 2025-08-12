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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="input w-full pl-10 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors"
          style={{ 
            focusRingColor: 'var(--accent-1)',
            borderColor: 'var(--muted)'
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}