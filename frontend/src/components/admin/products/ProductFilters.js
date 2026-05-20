'use client';

import { useState, useRef } from 'react';

export default function ProductFilters({ filters, categories, onChange }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debounceRef = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange({ ...filters, search: value || undefined });
    }, 300);
  };

  const handleCategory = (e) => {
    const value = e.target.value;
    onChange({ ...filters, category: value || undefined });
  };

  const handleStatus = (e) => {
    const value = e.target.value;
    if (value === '') {
      const { is_active, ...rest } = filters;
      onChange(rest);
    } else {
      onChange({ ...filters, is_active: value === 'true' });
    }
  };

  const handleClear = () => {
    setSearchValue('');
    onChange({});
  };

  const hasFilters = filters.search || filters.category || filters.is_active !== undefined;

  const currentStatus =
    filters.is_active === true ? 'true' : filters.is_active === false ? 'false' : '';

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white border border-gray-200 rounded-lg mb-4">
      <input
        type="text"
        placeholder="Search products..."
        value={searchValue}
        onChange={handleSearch}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-52"
      />

      <select
        value={filters.category || ''}
        onChange={handleCategory}
        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-3 text-sm">
        {[
          { label: 'All', value: '' },
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ].map(({ label, value }) => (
          <label key={value} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="status"
              value={value}
              checked={currentStatus === value}
              onChange={handleStatus}
              className="accent-gray-800"
            />
            {label}
          </label>
        ))}
      </div>

      {hasFilters && (
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 underline hover:text-gray-800"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
