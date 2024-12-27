import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, fileName) => {
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and download
  const blob = new Blob([write(workbook, { bookType: 'xlsx', type: 'array' })], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportToPDF = (data, columns, fileName) => {
  const doc = new jsPDF();

  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.accessor])),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 20 },
  });

  doc.save(`${fileName}.pdf`);
};

export const formatDataForExport = (data, type) => {
  switch (type) {
    case 'employees':
      return data.map(({ _id, password, ...rest }) => ({
        ...rest,
        createdAt: new Date(rest.createdAt).toLocaleDateString(),
      }));

    case 'leaves':
      return data.map(leave => ({
        ...leave,
        startDate: new Date(leave.startDate).toLocaleDateString(),
        endDate: new Date(leave.endDate).toLocaleDateString(),
        status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
      }));

    case 'timesheet':
      return data.map(entry => ({
        ...entry,
        date: new Date(entry.date).toLocaleDateString(),
        totalHours: Number(entry.totalHours).toFixed(2),
      }));

    case 'performance':
      return data.map(evaluation => ({
        ...evaluation,
        evaluationDate: new Date(evaluation.evaluationDate).toLocaleDateString(),
        score: Number(evaluation.score).toFixed(1),
      }));

    default:
      return data;
  }
};