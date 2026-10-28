import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * Reusable Custom Dropdown Component
 * Designed with Pakistan Property Care (PPC) signature luxury styling.
 * 
 * Props:
 * - value: Currently selected value
 * - onChange: Callback when value changes: (val) or (e) where e.target.value = val
 * - options: Array of options. Can be string array ['All', 'Active'] or object array [{ value: 'all', label: 'All', icon?: Icon }]
 * - placeholder: Default text when no value is selected (default: 'Select...')
 * - label: Optional label displayed above the dropdown
 * - icon: Optional leading Icon component (e.g. Filter, User, etc.)
 * - searchable: If true, renders a live search filter inside the options list
 * - disabled: If true, disables the dropdown
 * - className: Optional wrapper class string
 * - buttonClassName: Optional trigger button class overrides
 * - menuClassName: Optional popup menu class overrides
 * - align: 'left' | 'right' (default: 'left')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */
const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  label,
  icon: Icon,
  searchable = false,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'left',
  size = 'md',
  error,
  required = false,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options into { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.id,
        label: opt.label !== undefined ? opt.label : opt.name || String(opt.value),
        icon: opt.icon,
        description: opt.description
      };
    }
    return {
      value: opt,
      label: String(opt),
      icon: null
    };
  });

  // Find currently selected option
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Filter options if searchable is enabled
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    return opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, searchable]);

  // Handle select option
  const handleSelect = (option) => {
    if (onChange) {
      // Support both standard callback onChange(val) and synthetic event onChange({ target: { value } })
      const syntheticEvent = {
        target: { value: option.value, name: id }
      };
      onChange(option.value, syntheticEvent);
    }
    setIsOpen(false);
  };

  // Size variations
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2 px-3.5 text-sm',
    lg: 'py-2.5 px-4 text-base'
  }[size] || 'py-2 px-3.5 text-sm';

  return (
    <div className={`relative inline-block text-left w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border transition-all duration-200 outline-none
          ${
            disabled
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : isOpen
              ? 'bg-white border-[#002a1b] ring-2 ring-[#002a1b]/10 text-gray-900 shadow-sm'
              : 'bg-gray-50 hover:bg-white text-gray-800 border-gray-200 hover:border-gray-300'
          }
          ${error ? 'border-red-400 ring-2 ring-red-100' : ''}
          ${sizeClasses}
          ${buttonClassName}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate text-start min-w-0">
          {Icon && (
            <Icon
              size={size === 'sm' ? 14 : 16}
              className={`shrink-0 transition-colors ${
                isOpen ? 'text-[#002a1b]' : 'text-gray-400'
              }`}
            />
          )}

          {selectedOption?.icon && (
            <selectedOption.icon size={16} className="shrink-0 text-gray-500" />
          )}

          <span className={`truncate font-medium ${!selectedOption ? 'text-gray-400 font-normal' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ease-out rtl:rotate-180 ${
            isOpen ? 'rotate-180 text-[#002a1b]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-1.5 min-w-full w-max max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden 
            animate-in fade-in zoom-in-95 duration-150 origin-top
            ${align === 'right' ? 'right-0' : 'left-0'}
            ${menuClassName}
          `}
          role="listbox"
        >
          {/* Optional Search inside Menu */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-[#FAF8F3]">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#002a1b] focus:border-[#002a1b]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-gray-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs rounded-xl transition-all text-start group
                      ${
                        isSelected
                          ? 'bg-[#002a1b] text-white font-bold shadow-sm'
                          : 'text-gray-700 hover:bg-[#FAF8F3] hover:text-[#002a1b]'
                      }
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && (
                        <opt.icon
                          size={15}
                          className={isSelected ? 'text-white' : 'text-gray-400 group-hover:text-[#002a1b]'}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check size={14} className="shrink-0 text-[#C59B27] animate-scale-up" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  );
};

export default Dropdown;
