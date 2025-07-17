
import { AggregationFunction } from '../components/PivotTable';

export interface DataRow {
  [key: string]: string | number;
}

export interface PivotData {
  rows: Array<{
    data: Record<string, any>;
    values: Record<string, Record<string, number>>;
    totals: Record<string, number>;
  }>;
  columnHeaders: string[];
  grandTotals: Record<string, Record<string, number>>;
  overallTotals: Record<string, number>;
}

export function aggregateData(
  values: (string | number)[],
  func: AggregationFunction
): number {
  const numericValues = values.filter(v => typeof v === 'number') as number[];
  
  if (numericValues.length === 0) return 0;
  
  switch (func) {
    case 'sum':
      return numericValues.reduce((sum, val) => sum + val, 0);
    case 'count':
      return numericValues.length;
    case 'avg':
      return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    case 'min':
      return Math.min(...numericValues);
    case 'max':
      return Math.max(...numericValues);
    default:
      return 0;
  }
}

export function createPivotMatrix(
  data: DataRow[],
  rowFields: string[],
  columnFields: string[],
  valueFields: string[],
  aggregationFunction: AggregationFunction
): PivotData {
  // Group data by row fields
  const rowGroups = new Map<string, DataRow[]>();
  
  data.forEach(row => {
    const rowKey = rowFields.map(field => row[field]).join('|');
    if (!rowGroups.has(rowKey)) {
      rowGroups.set(rowKey, []);
    }
    rowGroups.get(rowKey)!.push(row);
  });

  // Get all unique column combinations
  const columnCombinations = new Set<string>();
  if (columnFields.length > 0) {
    data.forEach(row => {
      const colKey = columnFields.map(field => row[field]).join('|');
      columnCombinations.add(colKey);
    });
  } else {
    columnCombinations.add('Total');
  }

  const columnHeaders = Array.from(columnCombinations).sort();

  // Build pivot matrix
  const pivotRows: PivotData['rows'] = [];
  const grandTotals: Record<string, Record<string, number>> = {};
  const overallTotals: Record<string, number> = {};

  // Initialize grand totals
  columnHeaders.forEach(colHeader => {
    grandTotals[colHeader] = {};
    valueFields.forEach(valueField => {
      grandTotals[colHeader][valueField] = 0;
    });
  });

  valueFields.forEach(valueField => {
    overallTotals[valueField] = 0;
  });

  rowGroups.forEach((groupData, rowKey) => {
    const rowData: Record<string, any> = {};
    const rowValues: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};

    // Extract row field values
    rowFields.forEach((field, index) => {
      rowData[field] = rowKey.split('|')[index];
    });

    // Initialize row totals
    valueFields.forEach(valueField => {
      rowTotals[valueField] = 0;
    });

    // Calculate values for each column
    columnHeaders.forEach(colHeader => {
      rowValues[colHeader] = {};
      
      let columnData: DataRow[];
      if (columnFields.length > 0) {
        columnData = groupData.filter(row => {
          const colKey = columnFields.map(field => row[field]).join('|');
          return colKey === colHeader;
        });
      } else {
        columnData = groupData;
      }

      valueFields.forEach(valueField => {
        const values = columnData.map(row => row[valueField]);
        const aggregatedValue = aggregateData(values, aggregationFunction);
        
        rowValues[colHeader][valueField] = aggregatedValue;
        rowTotals[valueField] += aggregatedValue;
        grandTotals[colHeader][valueField] += aggregatedValue;
        overallTotals[valueField] += aggregatedValue;
      });
    });

    pivotRows.push({
      data: rowData,
      values: rowValues,
      totals: rowTotals
    });
  });

  return {
    rows: pivotRows,
    columnHeaders,
    grandTotals,
    overallTotals
  };
}
