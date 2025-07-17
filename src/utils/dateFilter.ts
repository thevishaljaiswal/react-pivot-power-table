
import { format, getWeek, getYear, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parse } from 'date-fns';

export interface DataRow {
  [key: string]: string | number;
  date: string;
}

export type FilterType = 'date' | 'week' | 'month' | 'year' | 'all';

export interface DateFilterConfig {
  type: FilterType;
  value: string | Date | null;
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

      default:
        return true;
    }
  });
}

export function getFilteredDataCount(data: DataRow[], filter: DateFilterConfig): number {
  return filterDataByDate(data, filter).length;
}
