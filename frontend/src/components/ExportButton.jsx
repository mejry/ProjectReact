import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { exportToExcel, exportToPDF, formatDataForExport } from '../utils/exports';

const ExportButton = ({ data, type, fileName }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const formattedData = formatDataForExport(data, type);
      
      if (format === 'excel') {
        exportToExcel(formattedData, fileName);
      } else {
        const columns = Object.keys(formattedData[0]).map(key => ({
          header: key.charAt(0).toUpperCase() + key.slice(1),
          accessor: key
        }));
        exportToPDF(formattedData, columns, fileName);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        className="flex items-center space-x-2 bg-white text-teal-600 hover:bg-teal-100 p-3 rounded-lg shadow-md transition-all"
        onClick={() => document.getElementById('export-dropdown').classList.toggle('hidden')}
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </Button>

      <div
        id="export-dropdown"
        className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
      >
        <div className="py-1">
          <button
            disabled={loading}
            onClick={() => handleExport('excel')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export to Excel
          </button>
          <button
            disabled={loading}
            onClick={() => handleExport('pdf')}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButton;