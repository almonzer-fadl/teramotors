'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface SearchProps<T> {
  onSearch: (item: T) => void;
  fetchSuggestions: (query: string) => Promise<T[]>;
  renderSuggestion: (item: T) => React.ReactNode;
  placeholder?: string;
}

export default function Search<T>({ 
  onSearch, 
  fetchSuggestions, 
  renderSuggestion,
  placeholder = 'Search...'
}: SearchProps<T>) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery).then(items => {
        setSuggestions(items);
        setIsOpen(true);
      });
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, fetchSuggestions]);

  const handleSelect = (item: T) => {
    onSearch(item);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {suggestions.map((item, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              {renderSuggestion(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
