import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; category?: string }>;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function SearchDropdown({
  value,
  onValueChange,
  options,
  placeholder = "Pesquisar...",
  className,
  emptyMessage = "Nenhum resultado encontrado."
}: SearchDropdownProps) {
  const [open, setOpen] = React.useState(false);

  // Group options by category
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, typeof options> = {};
    options.forEach(option => {
      const category = option.category || "Geral";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(option);
    });
    return groups;
  }, [options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onFocus={() => setOpen(true)}
            className="pl-10 pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setOpen(!open)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {Object.entries(groupedOptions).map(([category, items]) => (
              <CommandGroup key={category} heading={category}>
                {items.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}