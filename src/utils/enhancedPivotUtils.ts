// Enhanced pivot utilities with per-field aggregation and conversions

import { AggregationFunction } from '../components/PivotTable';
import { ConversionConfig, convertValue } from './conversionUtils';

export interface ValueField {
  field: string;
  aggregation: AggregationFunction;
  label?: string;
}

export interface DataRow {
  [key: string]: string | number;
}

export interface EnhancedPivotData {
  rows: Array<{
    data: Record<string, any>;
    values: Record<string, Record<string, number>>;
    totals: Record<string, number>;
  }>;
  columnHeaders: string[];
  grandTotals: Record<string, Record<string, number>>;
  overallTotals: Record<string, number>;
  valueFields: ValueField[];
}

export function aggregateDataWithFunction(
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

export function createEnhancedPivotMatrix(
  data: DataRow[],
  rowFields: string[],
  columnFields: string[],
  valueFields: ValueField[],
  conversions: ConversionConfig[] = []
): EnhancedPivotData {
  // Apply conversions to data first
  const convertedData = data.map(row => {
    const convertedRow = { ...row };
    
    conversions.forEach(conversion => {
      if (typeof row[conversion.field] === 'number') {
        convertedRow[conversion.field] = convertValue(
          row[conversion.field] as number,
          conversion.type,
          conversion.targetUnit
        );
      }
    });
    
    return convertedRow;
  });

  // Group data by row fields
  const rowGroups = new Map<string, DataRow[]>();
  
  convertedData.forEach(row => {
    const rowKey = rowFields.map(field => row[field]).join('|');
    if (!rowGroups.has(rowKey)) {
      rowGroups.set(rowKey, []);
    }
    rowGroups.get(rowKey)!.push(row);
  });

  // Get all unique column combinations
  const columnCombinations = new Set<string>();
  if (columnFields.length > 0) {
    convertedData.forEach(row => {
      const colKey = columnFields.map(field => row[field]).join('|');
      columnCombinations.add(colKey);
    });
  } else {
    columnCombinations.add('Total');
  }

  const columnHeaders = Array.from(columnCombinations).sort();

  // Build pivot matrix
  const pivotRows: EnhancedPivotData['rows'] = [];
  const grandTotals: Record<string, Record<string, number>> = {};
  const overallTotals: Record<string, number> = {};

  // Initialize grand totals
  columnHeaders.forEach(colHeader => {
    grandTotals[colHeader] = {};
    valueFields.forEach(valueField => {
      const fieldKey = `${valueField.field}_${valueField.aggregation}`;
      grandTotals[colHeader][fieldKey] = 0;
    });
  });

  valueFields.forEach(valueField => {
    const fieldKey = `${valueField.field}_${valueField.aggregation}`;
    overallTotals[fieldKey] = 0;
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
      const fieldKey = `${valueField.field}_${valueField.aggregation}`;
      rowTotals[fieldKey] = 0;
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
        const values = columnData.map(row => row[valueField.field]);
        const aggregatedValue = aggregateDataWithFunction(values, valueField.aggregation);
        const fieldKey = `${valueField.field}_${valueField.aggregation}`;
        
        rowValues[colHeader][fieldKey] = aggregatedValue;
        rowTotals[fieldKey] += aggregatedValue;
        grandTotals[colHeader][fieldKey] += aggregatedValue;
        overallTotals[fieldKey] += aggregatedValue;
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
    overallTotals,
    valueFields
  };
}