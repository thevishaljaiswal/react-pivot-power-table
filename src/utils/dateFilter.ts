
import { format, getWeek, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parse, subDays, startOfDay, endOfDay } from 'date-fns';

export interface DataRow {
  [key: string]: string | number;
  date: string;
}

export type FilterType = 'date' | 'week' | 'month' | 'year' | 'relative' | 'all';

export interface DateFilterConfig {
  type: FilterType;
  value: string | Date | null;
}

export interface FieldFilterConfig {
  field: string;
  values: string[];
}

export function filterDataByDate(data: DataRow[], filter: DateFilterConfig): DataRow[] {
  if (filter.type === 'all' || !filter.value) {
    return data;
  }

  return data.filter(row => {
    const rowDate = new Date(row.date);
    
    switch (filter.type) {
      case 'date':
        if (filter.value instanceof Date) {
          return format(rowDate, 'yyyy-MM-dd') === format(filter.value, 'yyyy-MM-dd');
        }
        return false;

      case 'week':
        if (typeof filter.value === 'string') {
          const [yearStr, weekStr] = filter.value.split('-');
          const targetYear = parseInt(yearStr);
          const targetWeek = parseInt(weekStr);
          
          if (isNaN(targetYear) || isNaN(targetWeek)) return false;
          
          const rowYear = getYear(rowDate);
          const rowWeek = getWeek(rowDate);
          
          return rowYear === targetYear && rowWeek === targetWeek;
        }
        return false;

      case 'month':
        if (typeof filter.value === 'string') {
          const [yearStr, monthStr] = filter.value.split('-');
          const targetYear = parseInt(yearStr);
          const targetMonth = parseInt(monthStr);
          
          if (isNaN(targetYear) || isNaN(targetMonth)) return false;
          
          const monthStart = startOfMonth(new Date(targetYear, targetMonth - 1));
          const monthEnd = endOfMonth(new Date(targetYear, targetMonth - 1));
          
          return isWithinInterval(rowDate, { start: monthStart, end: monthEnd });
        }
        return false;

      case 'year':
        if (typeof filter.value === 'string') {
          const targetYear = parseInt(filter.value);
          
          if (isNaN(targetYear)) return false;
          
          const yearStart = startOfYear(new Date(targetYear, 0));
          const yearEnd = endOfYear(new Date(targetYear, 0));
          
          return isWithinInterval(rowDate, { start: yearStart, end: yearEnd });
        }
        return false;

      case 'relative':
        if (typeof filter.value === 'string') {
          const now = new Date();
          
          switch (filter.value) {
            case 'last7days':
              const sevenDaysAgo = startOfDay(subDays(now, 7));
              const today = endOfDay(now);
              return isWithinInterval(rowDate, { start: sevenDaysAgo, end: today });
              
            case 'thisMonth':
              const monthStart = startOfMonth(now);
              const monthEnd = endOfMonth(now);
              return isWithinInterval(rowDate, { start: monthStart, end: monthEnd });
              
            case 'thisYear':
              const yearStart = startOfYear(now);
              const yearEnd = endOfYear(now);
              return isWithinInterval(rowDate, { start: yearStart, end: yearEnd });
              
            default:
              return true;
          }
        }
        return false;

      default:
        return true;
    }
  });
}

export function filterDataByFields(data: DataRow[], filters: FieldFilterConfig[]): DataRow[] {
  if (filters.length === 0) {
    return data;
  }

  return data.filter(row => {
    return filters.every(filter => {
      if (filter.values.length === 0) return true;
      return filter.values.includes(String(row[filter.field]));
    });
  });
}

export function getFilteredDataCount(data: DataRow[], dateFilter: DateFilterConfig, fieldFilters: FieldFilterConfig[] = []): number {
  let filteredData = filterDataByDate(data, dateFilter);
  filteredData = filterDataByFields(filteredData, fieldFilters);
  return filteredData.length;
}
