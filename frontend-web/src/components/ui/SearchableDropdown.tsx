import { useState, useEffect, useRef } from 'react';
import { masterApi } from '../../api/master';
import { Loader2, Search, X } from 'lucide-react';
import { clsx } from 'clsx';

interface DropdownItem {
  id: number;
  nama: string;
}

interface DropdownProps {
  value?: DropdownItem | null;
  onSelect: (item: DropdownItem | null) => void;
  placeholder?: string;
  error?: string;
  name?: string;
  pendidikanId?: number | null;
}

export default function SearchableDropdown({ 
  value, 
  onSelect, 
  placeholder = 'Cari...', 
  error,
  name,
  pendidikanId
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(value?.nama || '');
  const [options, setOptions] = useState<DropdownItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal search text with external value
  useEffect(() => {
    if (value) {
      setSearchText(value.nama);
    } else if (!isOpen) {
      setSearchText('');
    }
  }, [value, isOpen]);

  // Debounced search logic
  useEffect(() => {
    // skip if search text is too short or matches current value
    if (!searchText || searchText.length < 2 || searchText === value?.nama) {
      if (!searchText) setOptions([]);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      masterApi.getJurusan({ search: searchText, pendidikan_id: pendidikanId || undefined })
        .then((res) => {
          setOptions(res.data.data || []);
        })
        .catch(() => {
          setOptions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchText, pendidikanId]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchText('');
    onSelect(null);
    setOptions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          )}
        </div>
        
        <input 
          type="text"
          id={name}
          name={name}
          autoComplete="off"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={clsx(
            "w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border rounded-xl outline-none transition-all duration-200",
            "focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white",
            error ? "border-red-300 ring-red-50 bg-red-50/10" : "border-gray-200"
          )}
        />

        {searchText && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Options Dropdown */}
      {isOpen && searchText.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-indigo-100/50 max-h-64 overflow-y-auto animate-in fade-in zoom-in duration-200 origin-top">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-gray-400 mt-2 font-medium">Mencari data...</p>
            </div>
          ) : options.length > 0 ? (
            <div className="py-2">
              {options.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setSearchText(item.nama);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-3",
                    value?.id === item.id 
                      ? "bg-indigo-50 text-indigo-700 font-semibold" 
                      : "hover:bg-gray-50 text-gray-700 active:bg-indigo-50"
                  )}
                >
                  <div className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    value?.id === item.id ? "bg-indigo-500" : "bg-gray-200"
                  )} />
                  {item.nama}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500 font-medium italic">Tidak ditemukan hasil</p>
              <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain</p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
