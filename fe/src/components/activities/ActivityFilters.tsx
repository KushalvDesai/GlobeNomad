'use client';

import { ActivityCategory } from '@/graphql/types';
import { Filter, X } from 'lucide-react';

interface ActivityFiltersProps {
  categories: ActivityCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: 'ASC' | 'DESC';
  onSortOrderChange: (sortOrder: 'ASC' | 'DESC') => void;
  minPrice?: number;
  onMinPriceChange: (price: number | undefined) => void;
  maxPrice?: number;
  onMaxPriceChange: (price: number | undefined) => void;
  difficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  onClearFilters: () => void;
}

export default function ActivityFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  difficulty,
  onDifficultyChange,
  onClearFilters,
}: ActivityFiltersProps) {
  const difficulties = ['Easy', 'Moderate', 'Hard'];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'duration', label: 'Duration' },
    { value: 'rating', label: 'Rating' },
    { value: 'createdAt', label: 'Newest' },
  ];

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || difficulty || sortBy !== 'name' || sortOrder !== 'ASC';

  return (
    <div className="card card-hover p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" style={{ color: 'var(--accent-1)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-opacity-50 transition-colors"
            style={{ 
              focusRingColor: 'var(--accent-1)',
              borderColor: 'var(--muted)'
            }}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="input w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-opacity-50 transition-colors"
            style={{ 
              focusRingColor: 'var(--accent-1)',
              borderColor: 'var(--muted)'
            }}
          >
            <option value="">All difficulties</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min price"
                value={minPrice || ''}
                onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                className="input w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{ 
                  focusRingColor: 'var(--accent-1)',
                  borderColor: 'var(--muted)'
                }}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice || ''}
                onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                className="input w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-opacity-50 transition-colors"
                style={{ 
                  focusRingColor: 'var(--accent-1)',
                  borderColor: 'var(--muted)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>
            Sort by
          </label>
          <div className="space-y-3">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="input w-full px-3 py-2 rounded-md focus:ring-2 focus:ring-opacity-50 transition-colors"
              style={{ 
                focusRingColor: 'var(--accent-1)',
                borderColor: 'var(--muted)'
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => onSortOrderChange('ASC')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  sortOrder === 'ASC'
                    ? 'button-primary'
                    : 'button hover:opacity-90'
                }`}
              >
                Ascending
              </button>
              <button
                onClick={() => onSortOrderChange('DESC')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  sortOrder === 'DESC'
                    ? 'button-primary'
                    : 'button hover:opacity-90'
                }`}
              >
                Descending
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}