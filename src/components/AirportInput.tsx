import React, { useState, useRef, useEffect } from 'react';
import { AIRPORTS, Airport, normalizeText } from '../data/flightEngine';
import { Search, X } from 'lucide-react';

interface AirportInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string, airport?: Airport) => void;
}

export const AirportInput: React.FC<AirportInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<Airport[]>(AIRPORTS.slice(0, 8));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = normalizeText(value);
    if (!q) {
      setFiltered(AIRPORTS.slice(0, 10));
      return;
    }
    const matches = AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        normalizeText(a.city).includes(q) ||
        normalizeText(a.name).includes(q) ||
        normalizeText(a.state).includes(q)
    );
    setFiltered(matches.length > 0 ? matches.slice(0, 10) : AIRPORTS.slice(0, 6));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airport: Airport) => {
    onChange(`${airport.city} (${airport.code})`, airport);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-300 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-[#0B0F19] border border-slate-700/90 rounded-lg pl-3.5 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
            }}
            aria-label="Limpar campo"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-30 left-0 right-0 mt-1.5 bg-[#111827] border border-slate-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-800/70">
          {filtered.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onClick={() => handleSelect(airport)}
              className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-100 truncate">
                  {airport.city}
                  <span className="text-slate-500 font-normal"> · {airport.state}</span>
                </div>
                <div className="text-xs text-slate-400 truncate">{airport.name}</div>
              </div>
              <span className="font-mono text-xs font-semibold text-indigo-400 shrink-0 tabular-nums">
                {airport.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
