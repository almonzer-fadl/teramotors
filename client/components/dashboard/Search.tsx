"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Clock, Filter, Download } from 'lucide-react';
import { SearchService, SearchResult, SearchFilters } from '@/lib/search';
import { ExportService, ExportOptions } from '@/lib/export';

interface SearchProps {
  onResultClick?: (result: SearchResult) => void;
  onSearch?: (item: any) => void;
  placeholder?: string;
  className?: string;
  fetchSuggestions?: (query: string) => Promise<any[]>;
  renderSuggestion?: (item: any) => React.ReactNode;
}

export default function Search({ 
  onResultClick,
  onSearch, 
  placeholder = "Search customers, vehicles, appointments...",
  className = "",
  fetchSuggestions, 
  renderSuggestion
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch();
    } else {
        setResults([]);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      if (fetchSuggestions) {
        // Use custom suggestions function
        const customSuggestions = await fetchSuggestions(query);
        setResults(customSuggestions.map((item, index) => ({
          type: 'custom' as any,
          id: item._id || index.toString(),
          title: item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : item.name || 'Item',
          description: item.email || item.description || '',
          url: '',
          score: 100,
          data: item
        })));
      setSuggestions([]);
      } else {
        // Use global search
        const searchResults = await SearchService.globalSearch(query, filters, 10);
        setResults(searchResults);
        
        // Get suggestions for autocomplete
        const searchSuggestions = await SearchService.getSearchSuggestions(query, 5);
        setSuggestions(searchSuggestions);
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onSearch && result.data) {
      onSearch(result.data);
    } else if (onResultClick) {
      onResultClick(result);
    }
    setShowResults(false);
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowResults(false);
  };

  const handleExport = async (type: string, format: 'csv' | 'excel' | 'pdf') => {
    try {
      const exportOptions: ExportOptions = {
        format,
        ...filters
      };

      let result;
      switch (type) {
        case 'customers':
          result = await ExportService.exportCustomers(exportOptions);
          break;
        case 'vehicles':
          result = await ExportService.exportVehicles(exportOptions);
          break;
        case 'appointments':
          result = await ExportService.exportAppointments(exportOptions);
          break;
        case 'job-cards':
          result = await ExportService.exportJobCards(exportOptions);
          break;
        case 'invoices':
          result = await ExportService.exportInvoices(exportOptions);
          break;
        case 'estimates':
          result = await ExportService.exportEstimates(exportOptions);
          break;
        case 'inventory':
          result = await ExportService.exportInventory(exportOptions);
          break;
        default:
          return;
      }

      if (result.success && result.data) {
        // Create download link
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || `${type}-export.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'vehicle':
        return '🚗';
      case 'appointment':
        return '📅';
      case 'job':
        return '🔧';
      case 'invoice':
        return '🧾';
      case 'estimate':
        return '📋';
      case 'part':
        return '🔩';
      default:
        return '📄';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'customer':
        return 'Customer';
      case 'vehicle':
        return 'Vehicle';
      case 'appointment':
        return 'Appointment';
      case 'job':
        return 'Job Card';
      case 'invoice':
        return 'Invoice';
      case 'estimate':
        return 'Estimate';
      case 'part':
        return 'Part';
      default:
        return 'Item';
    }
  };

  function t(arg0: string): string | undefined {
    throw new Error('Function not implemented.');
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        
      <input
          ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 text-gray-400 hover:text-gray-600 ml-1"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type?.[0] || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value ? [e.target.value] : undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="customer">Customers</option>
                <option value="vehicle">Vehicles</option>
                <option value="appointment">Appointments</option>
                <option value="job">Job Cards</option>
                <option value="invoice">Invoices</option>
                <option value="estimate">Estimates</option>
                <option value="part">Parts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo?.toISOString().split('T')[0] || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setFilters({})}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {showResults && (results.length > 0 || suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          )}
          
          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b">
                Search Results ({results.length})
              </div>
              
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      {renderSuggestion && result.data ? (
                        renderSuggestion(result.data)
                      ) : (
                        <>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {getResultTypeLabel(result.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {result.description}
                          </p>
                        </>
                      )}
                    </div>
                    {!fetchSuggestions && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(result.type, 'csv');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title={t('ui.export_as_csv')}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {!loading && suggestions.length > 0 && results.length === 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b">
                Suggestions
              </div>
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {!loading && results.length === 0 && suggestions.length === 0 && query && (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}