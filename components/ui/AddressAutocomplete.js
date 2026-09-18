import React, { useState, useEffect, useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder, className }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500); // 500ms debounce
  };

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    setQuery(address);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(address);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className={className}
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder || 'Start typing an address...'}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
      />
      {isOpen && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '4px',
          padding: '4px 0',
          listStyle: 'none'
        }}>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '14px',
                color: '#334155',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FiMapPin style={{ marginTop: '2px', color: '#94a3b8', flexShrink: 0 }} />
              <span>{suggestion.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
