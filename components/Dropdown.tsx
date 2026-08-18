'use client';

import React from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string | number> {
  value: T;
  label: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

export interface DropdownProps<T = string | number> {
  value?: T;
  onChange?: (value: T) => void;
  options: DropdownOption<T>[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'outline' | 'ghost';
  isDarkTheme?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  menuPlacement?: 'bottom' | 'top' | 'auto';
  fullWidth?: boolean;
  id?: string;
}

export default function Dropdown<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  icon,
  size = 'sm',
  variant = 'default',
  isDarkTheme = true,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'left',
  menuPlacement = 'auto',
  fullWidth = true,
  id,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [openUpward, setOpenUpward] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  // Determine dropdown placement (upward vs downward)
  React.useEffect(() => {
    if (isOpen && containerRef.current) {
      if (menuPlacement === 'top') {
        setOpenUpward(true);
      } else if (menuPlacement === 'bottom') {
        setOpenUpward(false);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const estimatedHeight = Math.min(options.length * 36 + 20, 260);
        setOpenUpward(spaceBelow < estimatedHeight && rect.top > estimatedHeight);
      }
      
      const selectedIdx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, menuPlacement, options, value]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev + 1;
        while (next < options.length && options[next]?.disabled) {
          next++;
        }
        return next < options.length ? next : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && options[next]?.disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const current = options[highlightedIndex];
      if (current && !current.disabled && onChange) {
        onChange(current.value);
        setIsOpen(false);
      }
    }
  };

  // Size styling tokens
  const sizeStyles = {
    xs: 'text-[10px] sm:text-[11px] py-1 px-2 gap-1 rounded-md',
    sm: 'text-xs py-1.5 px-2.5 sm:px-3 gap-1.5 rounded-lg',
    md: 'text-xs sm:text-sm py-2 px-3 sm:px-3.5 gap-2 rounded-lg',
    lg: 'text-sm sm:text-base py-2.5 px-4 gap-2.5 rounded-xl',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  };

  // Base theme background & border classes
  const getThemeButtonStyles = () => {
    if (disabled) {
      return isDarkTheme
        ? 'bg-zinc-900/50 text-zinc-600 border-zinc-800/60 cursor-not-allowed opacity-60'
        : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed opacity-60';
    }

    switch (variant) {
      case 'compact':
        return isDarkTheme
          ? 'bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 border-zinc-700/80 hover:border-zinc-600 focus:border-[#1DB954]'
          : 'bg-zinc-100/90 hover:bg-zinc-200/90 text-zinc-800 border-zinc-300 hover:border-zinc-400 focus:border-[#1DB954]';
      case 'outline':
        return isDarkTheme
          ? 'bg-transparent hover:bg-zinc-800/60 text-zinc-200 border-zinc-700 hover:border-zinc-600'
          : 'bg-transparent hover:bg-zinc-100 text-zinc-800 border-zinc-300 hover:border-zinc-400';
      case 'ghost':
        return isDarkTheme
          ? 'bg-transparent hover:bg-zinc-800/70 text-zinc-300 hover:text-white border-transparent'
          : 'bg-transparent hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 border-transparent';
      case 'default':
      default:
        return isDarkTheme
          ? 'bg-zinc-800/95 hover:bg-zinc-750 text-zinc-100 border-zinc-700/80 hover:border-zinc-600 shadow-sm focus:border-[#1DB954]'
          : 'bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300 hover:border-zinc-400 shadow-sm focus:border-[#1DB954]';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${fullWidth ? 'w-full' : ''} ${className}`}
      onKeyDown={handleKeyDown}
      id={id}
    >
      {label && (
        <label
          className={`block text-[11px] font-medium uppercase tracking-wider mb-1 ${
            isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group flex items-center justify-between font-medium border transition-all duration-150 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[#1DB954]/50 ${
          fullWidth ? 'w-full' : ''
        } ${sizeStyles[size]} ${getThemeButtonStyles()} ${
          isOpen ? 'ring-1 ring-[#1DB954]/60 border-[#1DB954]' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
          {icon && <span className="flex-shrink-0 text-[#1DB954]">{icon}</span>}
          {selectedOption?.icon && (
            <span className="flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate block">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`${iconSizes[size]} ml-1 flex-shrink-0 transition-transform duration-200 ease-out text-zinc-400 group-hover:text-zinc-200 ${
            isOpen ? 'rotate-180 text-[#1DB954]' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popup Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          className={`absolute z-50 min-w-full ${
            fullWidth ? 'w-full' : 'w-max'
          } ${align === 'right' ? 'right-0' : 'left-0'} ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } rounded-xl border p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 origin-top overflow-hidden ${
            isDarkTheme
              ? 'bg-zinc-900/98 border-zinc-750 text-zinc-100 shadow-black/60 ring-1 ring-white/5'
              : 'bg-white/98 border-zinc-200 text-zinc-900 shadow-zinc-900/15 ring-1 ring-black/5'
          } ${menuClassName}`}
          style={{ maxHeight: '280px', overflowY: 'auto' }}
        >
          {options.length === 0 ? (
            <div
              className={`p-3 text-center text-xs ${
                isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              No options available
            </div>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!option.disabled && onChange) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 sm:py-2 rounded-lg text-left transition-all duration-100 cursor-pointer select-none ${
                    size === 'xs' ? 'text-[11px] py-1 px-2' : size === 'lg' ? 'text-sm py-2 px-3' : 'text-xs'
                  } ${
                    option.disabled
                      ? 'opacity-40 cursor-not-allowed text-zinc-500'
                      : isSelected
                      ? isDarkTheme
                        ? 'bg-[#006241]/35 text-[#1DB954] font-semibold'
                        : 'bg-[#1DB954]/15 text-[#006241] font-semibold'
                      : isHighlighted
                      ? isDarkTheme
                        ? 'bg-zinc-800 text-white'
                        : 'bg-zinc-100 text-zinc-900'
                      : isDarkTheme
                      ? 'text-zinc-300 hover:text-white'
                      : 'text-zinc-700 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {option.icon && (
                      <span className="flex-shrink-0">{option.icon}</span>
                    )}
                    <div className="truncate flex-1">
                      <div className="truncate font-medium">{option.label}</div>
                      {option.description && (
                        <div
                          className={`text-[10px] truncate ${
                            isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check
                      className={`${iconSizes[size]} text-[#1DB954] flex-shrink-0 ml-2 animate-in zoom-in duration-150`}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
