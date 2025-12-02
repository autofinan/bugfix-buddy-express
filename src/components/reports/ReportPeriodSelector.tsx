import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface ReportPeriodSelectorProps {
  onChange: (startDate: Date, endDate: Date) => void;
  defaultPeriod?: string;
}

export function ReportPeriodSelector({ onChange, defaultPeriod = "30days" }: ReportPeriodSelectorProps) {
  const [period, setPeriod] = useState(defaultPeriod);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (value) {
      case "7days":
        startDate = subDays(today, 6);
        break;
      case "15days":
        startDate = subDays(today, 14);
        break;
      case "30days":
        startDate = subDays(today, 29);
        break;
      case "thisMonth":
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      default:
        return;
    }

    onChange(startDate, endDate);
  };

  const handleCustomRange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      onChange(range.from, range.to);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Últimos 7 dias</SelectItem>
          <SelectItem value="15days">Últimos 15 dias</SelectItem>
          <SelectItem value="30days">Últimos 30 dias</SelectItem>
          <SelectItem value="thisMonth">Este mês</SelectItem>
          <SelectItem value="lastMonth">Mês anterior</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {period === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal",
                !customRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange?.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                    {format(customRange.to, "dd/MM/yyyy", { locale: ptBR })}
                  </>
                ) : (
                  format(customRange.from, "dd/MM/yyyy", { locale: ptBR })
                )
              ) : (
                <span>Selecione as datas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange?.from}
              selected={customRange}
              onSelect={handleCustomRange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
