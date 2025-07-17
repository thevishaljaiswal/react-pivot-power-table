
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface DataRow {
  [key: string]: string | number;
}

export interface FieldFilterConfig {
  field: string;
  values: string[];
}

interface FieldFilterProps {
  data: DataRow[];
  onFilterChange: (filters: FieldFilterConfig[]) => void;
  currentFilters: FieldFilterConfig[];
}

export const FieldFilter: React.FC<FieldFilterProps> = ({
  data,
  onFilterChange,
  currentFilters
}) => {
  const availableFields = React.useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(field => field !== 'date');
  }, [data]);

  const getUniqueValues = (fieldName: string) => {
    const values = new Set<string>();
    data.forEach(row => {
      const value = String(row[fieldName]);
      values.add(value);
    });
    return Array.from(values).sort();
  };

  const addFilter = (field: string) => {
    if (!currentFilters.find(f => f.field === field)) {
      onFilterChange([...currentFilters, { field, values: [] }]);
    }
  };

  const removeFilter = (field: string) => {
    onFilterChange(currentFilters.filter(f => f.field !== field));
  };

  const updateFilterValues = (field: string, values: string[]) => {
    const updatedFilters = currentFilters.map(f => 
      f.field === field ? { ...f, values } : f
    );
    onFilterChange(updatedFilters);
  };

  const toggleValue = (field: string, value: string) => {
    const filter = currentFilters.find(f => f.field === field);
    if (!filter) return;

    const newValues = filter.values.includes(value)
      ? filter.values.filter(v => v !== value)
      : [...filter.values, value];

    updateFilterValues(field, newValues);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Field Filters
          {currentFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Add Filter */}
          <div className="flex items-center gap-2">
            <Select onValueChange={addFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Add filter..." />
              </SelectTrigger>
              <SelectContent>
                {availableFields
                  .filter(field => !currentFilters.find(f => f.field === field))
                  .map(field => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {currentFilters.map(filter => (
            <div key={filter.field} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{filter.field}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.field)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {getUniqueValues(filter.field).map(value => (
                  <Badge
                    key={value}
                    variant={filter.values.includes(value) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleValue(filter.field, value)}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          ))}

          {currentFilters.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No field filters applied. Use the dropdown above to add filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
