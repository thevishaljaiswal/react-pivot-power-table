
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuickDateFilters } from './QuickDateFilters';

export type FilterType = 'date' | 'week' | 'month' | 'year' | 'relative' | 'all';

export interface DateFilterConfig {
  type: FilterType;
  value: string | Date | { from: Date; to: Date } | null;
}

interface DateFilterProps {
  onFilterChange: (filter: DateFilterConfig) => void;
  currentFilter: DateFilterConfig;
}

export const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, currentFilter }) => {
  const [selectedDateRange, setSelectedDateRange] = useState<{ from: Date; to: Date } | undefined>(
    currentFilter.value && typeof currentFilter.value === 'object' && 'from' in currentFilter.value 
      ? currentFilter.value 
      : undefined
  );
  const [weekNumber, setWeekNumber] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const handleFilterTypeChange = (type: FilterType) => {
    onFilterChange({ type, value: null });
    setSelectedDateRange(undefined);
    setWeekNumber('');
    setMonthYear('');
    setYear('');
  };

  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range?.from && range?.to) {
      const validRange = { from: range.from, to: range.to };
      setSelectedDateRange(validRange);
      onFilterChange({ type: 'date', value: validRange });
    } else if (range?.from && !range?.to) {
      // Allow partial selection during range selection
      setSelectedDateRange(range as { from: Date; to: Date });
    }
  };

  const handleWeekChange = (value: string) => {
    setWeekNumber(value);
    if (value) {
      onFilterChange({ type: 'week', value });
    }
  };

  const handleMonthYearChange = (value: string) => {
    setMonthYear(value);
    if (value) {
      onFilterChange({ type: 'month', value });
    }
  };

  const handleYearChange = (value: string) => {
    setYear(value);
    if (value) {
      onFilterChange({ type: 'year', value });
    }
  };

  const clearFilter = () => {
    onFilterChange({ type: 'all', value: null });
    setSelectedDateRange(undefined);
    setWeekNumber('');
    setMonthYear('');
    setYear('');
  };

  const renderFilterInput = () => {
    switch (currentFilter.type) {
      case 'date':
        return (
          <div className="flex items-center gap-2">
            <Label>Select Date Range:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDateRange?.from && selectedDateRange?.to 
                    ? `${format(selectedDateRange.from, "PPP")} - ${format(selectedDateRange.to, "PPP")}`
                    : "Pick a date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={selectedDateRange}
                  onSelect={handleDateRangeSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'week':
        return (
          <div className="flex items-center gap-2">
            <Label>Week (YYYY-WW):</Label>
            <Input
              type="text"
              placeholder="e.g., 2025-28"
              value={weekNumber}
              onChange={(e) => handleWeekChange(e.target.value)}
              className="w-[150px]"
            />
          </div>
        );

      case 'month':
        return (
          <div className="flex items-center gap-2">
            <Label>Month (YYYY-MM):</Label>
            <Input
              type="month"
              value={monthYear}
              onChange={(e) => handleMonthYearChange(e.target.value)}
              className="w-[150px]"
            />
          </div>
        );

      case 'year':
        return (
          <div className="flex items-center gap-2">
            <Label>Year:</Label>
            <Input
              type="number"
              placeholder="e.g., 2025"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-[120px]"
              min="1900"
              max="2100"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Date Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Filters */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Filters:</Label>
          <QuickDateFilters onFilterChange={onFilterChange} currentFilter={currentFilter} />
        </div>

        {/* Custom Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Custom Filter:</Label>
            <Select value={currentFilter.type} onValueChange={handleFilterTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="date">Date Range</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderFilterInput()}

          {currentFilter.type !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilter}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear Filter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
