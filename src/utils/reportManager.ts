
import { DateFilterConfig } from '../components/DateFilter';
import { FieldFilterConfig } from '../components/FieldFilter';
import { ValueField } from './enhancedPivotUtils';
import { ConversionConfig } from './conversionUtils';

export interface PivotReport {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  config: {
    selectedRows: string[];
    selectedColumns: string[];
    valueFields: ValueField[];
    conversions: ConversionConfig[];
    dateFilter: DateFilterConfig;
    fieldFilters: FieldFilterConfig[];
  };
}

const STORAGE_KEY = 'pivotReports';

export const reportManager = {
  // Get all saved reports
  getReports(): PivotReport[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading reports:', error);
      return [];
    }
  },

  // Save a new report
  saveReport(report: Omit<PivotReport, 'id' | 'createdAt' | 'updatedAt'>): PivotReport {
    const reports = this.getReports();
    const newReport: PivotReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    reports.push(newReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return newReport;
  },

  // Update an existing report
  updateReport(id: string, updates: Partial<PivotReport>): PivotReport | null {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return reports[index];
  },

  // Delete a report
  deleteReport(id: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    
    if (filtered.length === reports.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Rename a report
  renameReport(id: string, newName: string): PivotReport | null {
    return this.updateReport(id, { name: newName });
  }
};
