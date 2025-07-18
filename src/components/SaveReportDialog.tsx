
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportManager, PivotReport } from '../utils/reportManager';
import { DateFilterConfig } from './DateFilter';
import { FieldFilterConfig } from './FieldFilter';

interface SaveReportDialogProps {
  selectedRows: string[];
  selectedColumns: string[];
  selectedValues: string[];
  aggregationFunction: 'sum' | 'count' | 'avg' | 'min' | 'max';
  dateFilter: DateFilterConfig;
  fieldFilters: FieldFilterConfig[];
  onReportSaved?: (report: PivotReport) => void;
}

export const SaveReportDialog: React.FC<SaveReportDialogProps> = ({
  selectedRows,
  selectedColumns,
  selectedValues,
  aggregationFunction,
  dateFilter,
  fieldFilters,
  onReportSaved
}) => {
  const [open, setOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!reportName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const report = reportManager.saveReport({
        name: reportName.trim(),
        config: {
          selectedRows,
          selectedColumns,
          selectedValues,
          aggregationFunction,
          dateFilter,
          fieldFilters,
        }
      });

      toast({
        title: "Success",
        description: `Report "${report.name}" saved successfully`,
      });

      onReportSaved?.(report);
      setReportName('');
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilterTypeLabel = (type: DateFilterConfig['type']) => {
    switch (type) {
      case 'date': return 'Specific Date';
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'year': return 'Year';
      case 'relative': return 'Relative';
      case 'all': return 'All Data';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Pivot Table Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Name</label>
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="Enter report name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>This will save your current configuration:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Rows: {selectedRows.join(', ') || 'None'}</li>
              <li>Columns: {selectedColumns.join(', ') || 'None'}</li>
              <li>Values: {selectedValues.join(', ') || 'None'}</li>
              <li>Aggregation: {aggregationFunction}</li>
              <li>Date Filter: {getFilterTypeLabel(dateFilter.type)}</li>
              <li>Field Filters: {fieldFilters.length} active</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
