
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CalendarDays, CalendarRange } from 'lucide-react';
import { DateFilterConfig } from './DateFilter';

interface QuickDateFiltersProps {
  onFilterChange: (filter: DateFilterConfig) => void;
  currentFilter: DateFilterConfig;
}

export const QuickDateFilters: React.FC<QuickDateFiltersProps> = ({
  onFilterChange,
  currentFilter
}) => {
  const quickFilters = [
    {
      label: 'Last 7 Days',
      value: 'last7days',
      icon: Clock,
      filter: { type: 'relative' as const, value: 'last7days' }
    },
    {
      label: 'This Month',
      value: 'thisMonth',
      icon: CalendarDays,
      filter: { type: 'relative' as const, value: 'thisMonth' }
    },
    {
      label: 'This Year',
      value: 'thisYear',
      icon: CalendarRange,
      filter: { type: 'relative' as const, value: 'thisYear' }
    },
    {
      label: 'All Data',
      value: 'all',
      icon: Calendar,
      filter: { type: 'all' as const, value: null }
    }
  ];

  const isActive = (filterValue: string) => {
    if (filterValue === 'all') {
      return currentFilter.type === 'all';
    }
    return currentFilter.type === 'relative' && currentFilter.value === filterValue;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.value}
            variant={isActive(filter.value) ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.filter)}
            className="flex items-center gap-1"
          >
            <Icon className="h-3 w-3" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};
