
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
  value: string | Date | null;
}

interface DateFilterProps {
  onFilterChange: (filter: DateFilterConfig) => void;
  currentFilter: DateFilterConfig;
}

export const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, currentFilter }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentFilter.value instanceof Date ? currentFilter.value : undefined
  );
  const [weekNumber, setWeekNumber] = useState<string>('');
  const [monthYear, setMonthYear] = useState<string>('');
  const [year, setYear] = useState<string>('');

  const handleFilterTypeChange = (type: FilterType) => {
    onFilterChange({ type, value: null });
    setSelectedDate(undefined);
    setWeekNumber('');
    setMonthYear('');
    setYear('');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onFilterChange({ type: 'date', value: date });
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
    setSelectedDate(undefined);
    setWeekNumber('');
    setMonthYear('');
    setYear('');
  };

  const renderFilterInput = () => {
    switch (currentFilter.type) {
      case 'date':
        return (
          <div className="flex items-center gap-2">
            <Label>Select Date:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
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
                <SelectItem value="date">Specific Date</SelectItem>
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
