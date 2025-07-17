
import { PivotData } from './pivotUtils';

export function exportToCSV(data: PivotData, filename: string): void {
  const csvContent = generateCSVContent(data);
  downloadCSV(csvContent, filename);
}

function generateCSVContent(data: PivotData): string {
  const rows: string[] = [];
  
  if (data.rows.length === 0) return '';
  
  // Get row field names and value field names
  const rowFields = Object.keys(data.rows[0].data);
  const valueFields = Object.keys(data.overallTotals);
  
  // Create header row
  const headers = [
    ...rowFields,
    ...data.columnHeaders.flatMap(colHeader => 
      valueFields.map(valueField => `${colHeader}_${valueField}`)
    ),
    ...valueFields.map(field => `Total_${field}`)
  ];
  rows.push(headers.map(h => `"${h}"`).join(','));
  
  // Add data rows
  data.rows.forEach(row => {
    const csvRow = [
      // Row field values
      ...rowFields.map(field => `"${row.data[field]}"`),
      // Column values
      ...data.columnHeaders.flatMap(colHeader =>
        valueFields.map(valueField => {
          const value = row.values[colHeader]?.[valueField] || 0;
          return typeof value === 'number' ? value.toString() : `"${value}"`;
        })
      ),
      // Row totals
      ...valueFields.map(valueField => {
        const value = row.totals[valueField] || 0;
        return typeof value === 'number' ? value.toString() : `"${value}"`;
      })
    ];
    rows.push(csvRow.join(','));
  });
  
  // Add grand totals row
  const grandTotalRow = [
    // Row field placeholder
    ...rowFields.map(() => '"Grand Total"').slice(0, 1),
    ...Array(rowFields.length - 1).fill('""'),
    // Column grand totals
    ...data.columnHeaders.flatMap(colHeader =>
      valueFields.map(valueField => {
        const value = data.grandTotals[colHeader]?.[valueField] || 0;
        return typeof value === 'number' ? value.toString() : `"${value}"`;
      })
    ),
    // Overall totals
    ...valueFields.map(valueField => {
      const value = data.overallTotals[valueField] || 0;
      return typeof value === 'number' ? value.toString() : `"${value}"`;
    })
  ];
  rows.push(grandTotalRow.join(','));
  
  return rows.join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
