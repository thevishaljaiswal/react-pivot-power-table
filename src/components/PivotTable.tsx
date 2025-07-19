import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3, PieChart, ArrowUpDown, Database, Filter, FileText } from 'lucide-react';
import { PivotChart } from './PivotChart';
import { DateFilter, DateFilterConfig } from './DateFilter';
import { FieldFilter, FieldFilterConfig } from './FieldFilter';
import { ValueFieldSelector } from './ValueFieldSelector';
import { exportToCSV } from '../utils/csvExport';
import { createEnhancedPivotMatrix, ValueField } from '../utils/enhancedPivotUtils';
import { filterDataByDate, filterDataByFields, getFilteredDataCount } from '../utils/dateFilter';
import { ConversionConfig, formatValueWithUnit, detectFieldType } from '../utils/conversionUtils';
import { SaveReportDialog } from './SaveReportDialog';
import { ReportManager } from './ReportManager';
import { useToast } from '@/hooks/use-toast';

interface DataRow {
  [key: string]: string | number;
  date: string;
}

interface PivotTableProps {
  data: DataRow[];
}

export type AggregationFunction = 'sum' | 'count' | 'avg' | 'min' | 'max';

const PivotTable: React.FC<PivotTableProps> = ({ data }) => {
  const { toast } = useToast();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [valueFields, setValueFields] = useState<ValueField[]>([]);
  const [conversions, setConversions] = useState<ConversionConfig[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [dateFilter, setDateFilter] = useState<DateFilterConfig>({ type: 'all', value: null });
  const [fieldFilters, setFieldFilters] = useState<FieldFilterConfig[]>([]);

  // Filter data based on date and field filters
  const filteredData = useMemo(() => {
    let result = filterDataByDate(data, dateFilter);
    result = filterDataByFields(result, fieldFilters);
    return result;
  }, [data, dateFilter, fieldFilters]);

  // Get available fields from filtered data
  const fields = useMemo(() => {
    if (filteredData.length === 0) return [];
    return Object.keys(filteredData[0]).filter(field => field !== 'date');
  }, [filteredData]);

  // Get numeric fields for values
  const numericFields = useMemo(() => {
    if (filteredData.length === 0) return [];
    return fields.filter(field => 
      filteredData.some(row => typeof row[field] === 'number')
    );
  }, [filteredData, fields]);

  // Create pivot data using filtered data
  const pivotData = useMemo(() => {
    if (selectedRows.length === 0 || valueFields.length === 0) return null;
    
    return createEnhancedPivotMatrix(
      filteredData,
      selectedRows,
      selectedColumns,
      valueFields,
      conversions
    );
  }, [filteredData, selectedRows, selectedColumns, valueFields, conversions]);

  // Sort pivot data
  const sortedPivotData = useMemo(() => {
    if (!pivotData || !sortConfig) return pivotData;

    const sorted = { ...pivotData };
    sorted.rows = [...pivotData.rows].sort((a, b) => {
      const aValue = a.data[sortConfig.key];
      const bValue = b.data[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [pivotData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleExportCSV = () => {
    if (!sortedPivotData) return;
    exportToCSV(sortedPivotData, 'pivot-table-export.csv');
  };

  const addField = (field: string, type: 'rows' | 'columns') => {
    switch (type) {
      case 'rows':
        if (!selectedRows.includes(field)) {
          setSelectedRows([...selectedRows, field]);
        }
        break;
      case 'columns':
        if (!selectedColumns.includes(field)) {
          setSelectedColumns([...selectedColumns, field]);
        }
        break;
    }
  };

  const removeField = (field: string, type: 'rows' | 'columns') => {
    switch (type) {
      case 'rows':
        setSelectedRows(selectedRows.filter(f => f !== field));
        break;
      case 'columns':
        setSelectedColumns(selectedColumns.filter(f => f !== field));
        break;
    }
  };

  const handleDateFilterChange = (filter: DateFilterConfig) => {
    setDateFilter(filter);
  };

  const handleFieldFiltersChange = (filters: FieldFilterConfig[]) => {
    setFieldFilters(filters);
  };

  const handleLoadReport = (config: {
    selectedRows: string[];
    selectedColumns: string[];
    valueFields: ValueField[];
    conversions: ConversionConfig[];
    dateFilter: DateFilterConfig;
    fieldFilters: FieldFilterConfig[];
  }) => {
    setSelectedRows(config.selectedRows);
    setSelectedColumns(config.selectedColumns);
    setValueFields(config.valueFields || []);
    setConversions(config.conversions || []);
    setDateFilter(config.dateFilter);
    setFieldFilters(config.fieldFilters);
    
    toast({
      title: "Report Loaded",
      description: "Pivot table configuration has been applied",
    });
  };

  const filteredRecordCount = getFilteredDataCount(data, dateFilter, fieldFilters);
  const hasActiveFilters = dateFilter.type !== 'all' || fieldFilters.length > 0;

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <DateFilter 
        onFilterChange={handleDateFilterChange}
        currentFilter={dateFilter}
      />

      {/* Field Filter */}
      <FieldFilter 
        data={data}
        onFilterChange={handleFieldFiltersChange}
        currentFilters={fieldFilters}
      />

      {/* Filter Results Info */}
      {hasActiveFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Database className="h-4 w-4" />
                <span>
                  Showing {filteredRecordCount} of {data.length} records
                  {filteredRecordCount !== data.length && ' (filtered)'}
                </span>
              </div>
              {(dateFilter.type !== 'all' || fieldFilters.length > 0) && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    {dateFilter.type !== 'all' ? 1 : 0} date filter{dateFilter.type !== 'all' && dateFilter.type !== 'relative' ? '' : 's'} + {fieldFilters.length} field filter{fieldFilters.length !== 1 ? 's' : ''} active
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <ReportManager onLoadReport={handleLoadReport} />
            <SaveReportDialog
              selectedRows={selectedRows}
              selectedColumns={selectedColumns}
              valueFields={valueFields}
              conversions={conversions}
              dateFilter={dateFilter}
              fieldFilters={fieldFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pivot Table Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Available Fields</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {fields.map(field => (
                  <div key={field} className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addField(field, 'rows')}
                      className="text-xs"
                    >
                      → Rows
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addField(field, 'columns')}
                      className="text-xs"
                    >
                      → Columns
                    </Button>
                    <span className="text-xs py-1 px-2 bg-gray-100 rounded flex-1">
                      {field}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rows</label>
              <div className="space-y-1 min-h-[100px] border rounded-md p-2">
                {selectedRows.map(field => (
                  <Badge key={field} variant="secondary" className="mr-1">
                    {field}
                    <button
                      onClick={() => removeField(field, 'rows')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Columns</label>
              <div className="space-y-1 min-h-[100px] border rounded-md p-2">
                {selectedColumns.map(field => (
                  <Badge key={field} variant="secondary" className="mr-1">
                    {field}
                    <button
                      onClick={() => removeField(field, 'columns')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Value Fields with Individual Aggregation and Conversion */}
          <ValueFieldSelector
            availableFields={numericFields}
            valueFields={valueFields}
            conversions={conversions}
            onValueFieldsChange={setValueFields}
            onConversionsChange={setConversions}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleExportCSV}
              disabled={!sortedPivotData}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowChart(!showChart)}
              disabled={!sortedPivotData}
              variant="outline"
              size="sm"
            >
              {showChart ? <PieChart className="h-4 w-4 mr-2" /> : <BarChart3 className="h-4 w-4 mr-2" />}
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
            {showChart && (
              <Select value={chartType} onValueChange={(value: 'bar' | 'pie') => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Visualization */}
      {showChart && sortedPivotData && (
        <Card>
          <CardHeader>
            <CardTitle>Chart Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <PivotChart data={sortedPivotData} type={chartType} />
          </CardContent>
        </Card>
      )}

      {/* Pivot Table */}
      {sortedPivotData && (
        <Card>
          <CardHeader>
            <CardTitle>Pivot Table Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-96 border rounded-md">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    {selectedRows.map(row => (
                      <th key={row} className="border p-2 text-left bg-gray-50 sticky left-0 z-20">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort(row)}
                          className="font-medium text-xs p-0 h-auto"
                        >
                          {row}
                          <ArrowUpDown className="h-3 w-3 ml-1" />
                        </Button>
                      </th>
                    ))}
                    {sortedPivotData.columnHeaders.map(header => (
                      <th key={header} className="border p-2 text-center bg-gray-50 min-w-[100px]">
                        <div className="font-medium text-xs">{header}</div>
                      </th>
                    ))}
                    {valueFields.length > 0 && (
                      <th className="border p-2 text-center bg-gray-100 font-bold sticky right-0 z-20">
                        Total
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedPivotData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {selectedRows.map(rowField => (
                        <td key={rowField} className="border p-2 font-medium bg-gray-25 sticky left-0 z-10">
                          {row.data[rowField]}
                        </td>
                      ))}
                      {sortedPivotData.columnHeaders.map(colHeader => (
                        <td key={colHeader} className="border p-2 text-center">
                          {valueFields.map((valueField, index) => {
                            const fieldKey = `${valueField.field}_${valueField.aggregation}`;
                            const conversion = conversions.find(c => c.field === valueField.field);
                            const value = row.values[colHeader]?.[fieldKey];
                            
                            return (
                              <div key={fieldKey} className={index > 0 ? 'mt-1 pt-1 border-t' : ''}>
                                <span className="text-xs text-gray-600">
                                  {valueField.label || valueField.field} ({valueField.aggregation}):
                                </span>
                                <span className="ml-1 font-medium">
                                  {typeof value === 'number' 
                                    ? (conversion 
                                        ? formatValueWithUnit(value, conversion.type, conversion.targetUnit)
                                        : value.toLocaleString()
                                      )
                                    : value || '-'
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </td>
                      ))}
                      {valueFields.length > 0 && (
                        <td className="border p-2 text-center font-bold bg-gray-50 sticky right-0 z-10">
                          {valueFields.map((valueField, index) => {
                            const fieldKey = `${valueField.field}_${valueField.aggregation}`;
                            const conversion = conversions.find(c => c.field === valueField.field);
                            const value = row.totals[fieldKey];
                            
                            return (
                              <div key={fieldKey} className={index > 0 ? 'mt-1 pt-1 border-t' : ''}>
                                <span className="text-xs text-gray-600">
                                  {valueField.label || valueField.field} ({valueField.aggregation}):
                                </span>
                                <span className="ml-1">
                                  {typeof value === 'number' 
                                    ? (conversion 
                                        ? formatValueWithUnit(value, conversion.type, conversion.targetUnit)
                                        : value.toLocaleString()
                                      )
                                    : value || '-'
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </td>
                      )}
                    </tr>
                  ))}
                  {/* Grand Total Row */}
                  {sortedPivotData.grandTotals && (
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={selectedRows.length} className="border p-2 sticky left-0 z-10 bg-gray-100">
                        Grand Total
                      </td>
                      {sortedPivotData.columnHeaders.map(colHeader => (
                        <td key={colHeader} className="border p-2 text-center">
                          {valueFields.map((valueField, index) => {
                            const fieldKey = `${valueField.field}_${valueField.aggregation}`;
                            const conversion = conversions.find(c => c.field === valueField.field);
                            const value = sortedPivotData.grandTotals[colHeader]?.[fieldKey];
                            
                            return (
                              <div key={fieldKey} className={index > 0 ? 'mt-1 pt-1 border-t' : ''}>
                                <span className="text-xs text-gray-600">
                                  {valueField.label || valueField.field} ({valueField.aggregation}):
                                </span>
                                <span className="ml-1">
                                  {typeof value === 'number' 
                                    ? (conversion 
                                        ? formatValueWithUnit(value, conversion.type, conversion.targetUnit)
                                        : value.toLocaleString()
                                      )
                                    : value || '-'
                                  }
                                </span>
                              </div>
                            );
                          })}
                        </td>
                      ))}
                      <td className="border p-2 text-center sticky right-0 z-10 bg-gray-100">
                        {valueFields.map((valueField, index) => {
                          const fieldKey = `${valueField.field}_${valueField.aggregation}`;
                          const conversion = conversions.find(c => c.field === valueField.field);
                          const value = sortedPivotData.overallTotals[fieldKey];
                          
                          return (
                            <div key={fieldKey} className={index > 0 ? 'mt-1 pt-1 border-t' : ''}>
                              <span className="text-xs text-gray-600">
                                {valueField.label || valueField.field} ({valueField.aggregation}):
                              </span>
                              <span className="ml-1">
                                {typeof value === 'number' 
                                  ? (conversion 
                                      ? formatValueWithUnit(value, conversion.type, conversion.targetUnit)
                                      : value.toLocaleString()
                                    )
                                  : value || '-'
                                }
                              </span>
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!sortedPivotData && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Configure Your Pivot Table</h3>
              <p className="text-sm">
                Add fields to Rows and Values to start. You can also add Columns for cross-tabulation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PivotTable;
