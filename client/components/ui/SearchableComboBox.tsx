'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SearchableComboBoxOption {
  value: string;
  label: string;
  searchText?: string; // Additional text to search through
}

interface SearchableComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableComboBoxOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onCreateNew?: () => void;
  createNewLabel?: string;
  emptyMessage?: string;
  className?: string;
}

export default function SearchableComboBox({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  disabled = false,
  required = false,
  onCreateNew,
  createNewLabel,
  emptyMessage,
  className = '',
}: SearchableComboBoxProps) {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Get selected option label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Filter options based on search query
  const filteredOptions = options.filter(option => {
    const searchIn = `${option.label} ${option.searchText || ''}`.toLowerCase();
    return searchIn.includes(searchQuery.toLowerCase());
  });

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown on scroll/resize for better UX
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      setIsOpen(false);
      setSearchQuery('');
    };

    // Close dropdown when user scrolls or resizes
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            Math.min(prev + 1, filteredOptions.length + (onCreateNew ? 0 : -1))
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex].value);
          } else if (onCreateNew && highlightedIndex === filteredOptions.length) {
            handleCreateNew();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, filteredOptions, highlightedIndex, onCreateNew]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        // Only scroll within the dropdown, not the whole page
        const dropdown = dropdownRef.current;
        const dropdownRect = dropdown.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();

        if (elementRect.bottom > dropdownRect.bottom) {
          dropdown.scrollTop += elementRect.bottom - dropdownRect.bottom;
        } else if (elementRect.top < dropdownRect.top) {
          dropdown.scrollTop -= dropdownRect.top - elementRect.top;
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      setIsOpen(false);
      setSearchQuery('');
      onCreateNew();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
    } else {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Button/Input */}
      <div
        onClick={toggleOpen}
        className={`
          w-full px-4 py-3.5 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl
          focus-within:ring-4 focus-within:ring-[#F97402]/20 focus-within:border-[#F97402]
          transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder:text-gray-400
          bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-gray-300 dark:hover:border-gray-600
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-4 ring-[#F97402]/20 border-[#F97402]' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 outline-none bg-transparent"
              disabled={disabled}
            />
          ) : (
            <span className={displayValue ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
              {displayValue || placeholder}
            </span>
          )}
          
          <div className="flex items-center gap-2">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
            <ChevronDown
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown Portal */}
      {isOpen && mounted && createPortal(
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: `${dropdownPosition.top + 8}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-80 overflow-y-auto"
        >
          {filteredOptions.length === 0 && !onCreateNew && (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
              <p>{emptyMessage || t('ui.no_results_found')}</p>
            </div>
          )}

          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                px-6 py-3 cursor-pointer transition-colors text-gray-900 dark:text-white
                ${highlightedIndex === index ? 'bg-[#F97402]/10 text-[#F97402]' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                ${option.value === value ? 'bg-[#F97402]/5 font-semibold' : ''}
              `}
            >
              {option.label}
            </div>
          ))}

          {/* Create New Option */}
          {onCreateNew && filteredOptions.length === 0 && searchQuery && (
            <div
              onClick={handleCreateNew}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              className={`
                px-6 py-4 cursor-pointer transition-colors border-t-2 border-dashed border-gray-200 dark:border-gray-700
                ${highlightedIndex === filteredOptions.length ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {createNewLabel || t('ui.create_new')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('ui.no_matches_create_new')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Always show create new button at bottom if provided */}
          {onCreateNew && filteredOptions.length > 0 && (
            <div
              onClick={handleCreateNew}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              className={`
                px-6 py-3 cursor-pointer transition-colors border-t-2 border-gray-100 dark:border-gray-700
                ${highlightedIndex === filteredOptions.length ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
            >
              <div className="flex items-center gap-2 font-semibold">
                <Plus className="h-4 w-4" />
                <span>{createNewLabel || t('ui.create_new')}</span>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

