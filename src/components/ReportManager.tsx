
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FolderOpen, Trash2, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportManager, PivotReport } from '../utils/reportManager';
import { DateFilterConfig } from './DateFilter';
import { FieldFilterConfig } from './FieldFilter';
import { ValueField } from '../utils/enhancedPivotUtils';
import { ConversionConfig } from '../utils/conversionUtils';

interface ReportManagerProps {
  onLoadReport: (config: {
    selectedRows: string[];
    selectedColumns: string[];
    valueFields: ValueField[];
    conversions: ConversionConfig[];
    dateFilter: DateFilterConfig;
    fieldFilters: FieldFilterConfig[];
  }) => void;
}

export const ReportManager: React.FC<ReportManagerProps> = ({ onLoadReport }) => {
  const [reports, setReports] = useState<PivotReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingReport, setRenamingReport] = useState<PivotReport | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const savedReports = reportManager.getReports();
    setReports(savedReports);
  };

  const handleLoadReport = () => {
    if (!selectedReportId) return;
    
    const report = reports.find(r => r.id === selectedReportId);
    if (!report) return;

    onLoadReport(report.config);
    toast({
      title: "Success",
      description: `Report "${report.name}" loaded successfully`,
    });
  };

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const success = reportManager.deleteReport(reportId);
    if (success) {
      loadReports();
      if (selectedReportId === reportId) {
        setSelectedReportId('');
      }
      toast({
        title: "Success",
        description: `Report "${report.name}" deleted successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    }
  };

  const handleRenameReport = () => {
    if (!renamingReport || !newName.trim()) return;

    const updatedReport = reportManager.renameReport(renamingReport.id, newName.trim());
    if (updatedReport) {
      loadReports();
      setRenameDialogOpen(false);
      setRenamingReport(null);
      setNewName('');
      toast({
        title: "Success",
        description: `Report renamed to "${updatedReport.name}"`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to rename report",
        variant: "destructive",
      });
    }
  };

  const startRename = (report: PivotReport) => {
    setRenamingReport(report);
    setNewName(report.name);
    setRenameDialogOpen(true);
  };

  if (reports.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        <FileText className="h-4 w-4 inline mr-2" />
        No saved reports yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={selectedReportId} onValueChange={setSelectedReportId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a report..." />
          </SelectTrigger>
          <SelectContent>
            {reports.map((report) => (
              <SelectItem key={report.id} value={report.id}>
                {report.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          onClick={handleLoadReport}
          disabled={!selectedReportId}
          variant="outline"
          size="sm"
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Load
        </Button>
        
        {selectedReportId && (
          <>
            <Button
              onClick={() => {
                const report = reports.find(r => r.id === selectedReportId);
                if (report) startRename(report);
              }}
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Report</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this report? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteReport(selectedReportId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Report</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-sm font-medium mb-2 block">New Name</label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameReport();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameReport} disabled={!newName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
