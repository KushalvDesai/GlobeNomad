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
    <div className="bg-[#0f0f17] border border-[#2a2a35] rounded-lg p-6 hover:bg-[#14141c] transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-[#27C3FF]" />
          <h3 className="text-lg font-semibold text-[#E6E8EB]">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-[#9AA0A6] hover:text-[#E6E8EB] transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-3 text-[#E6E8EB]">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
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
          <label className="block text-sm font-medium mb-3 text-[#E6E8EB]">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
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
          <label className="block text-sm font-medium mb-3 text-[#E6E8EB]">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min price"
                value={minPrice || ''}
                onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max price"
                value={maxPrice || ''}
                onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] placeholder-[#9AA0A6] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium mb-3 text-[#E6E8EB]">
            Sort by
          </label>
          <div className="space-y-3">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] focus:outline-none focus:ring-2 focus:ring-[#27C3FF] transition-colors"
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
                    ? 'bg-[#27C3FF] text-[#0f0f17] font-medium'
                    : 'bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#14141c]'
                }`}
              >
                Ascending
              </button>
              <button
                onClick={() => onSortOrderChange('DESC')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  sortOrder === 'DESC'
                    ? 'bg-[#27C3FF] text-[#0f0f17] font-medium'
                    : 'bg-[#0f0f17] border border-[#2a2a35] text-[#E6E8EB] hover:bg-[#14141c]'
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