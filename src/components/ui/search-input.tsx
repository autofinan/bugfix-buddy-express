import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps<T> {
  items: T[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  placeholder?: string;
  getItemLabel: (item: T) => string;
  getItemKey: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SearchInput<T>({
  items,
  value,
  onChange,
  onSelect,
  placeholder = "Digite para buscar...",
  getItemLabel,
  getItemKey,
  renderItem,
  className,
  disabled = false,
}: SearchInputProps<T>) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setOpen(newValue.length > 0 && items.length > 0);
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    onChange("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(value.length > 0 && items.length > 0)}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {open && items.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {items.map((item) => (
            <div
              key={getItemKey(item)}
              onClick={() => handleSelect(item)}
              className="p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-0"
            >
              {renderItem ? renderItem(item) : (
                <div className="text-sm">{getItemLabel(item)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
