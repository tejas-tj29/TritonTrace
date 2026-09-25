import { reportStore } from '../store/reportStore';

export const reportService = {
  createReport: (reportData) => {
    const timestampStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8); // YYYYMMDD
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const id = `RPT-${timestampStr}-${randomId}`;

    const newReport = {
      id,
      ...reportData,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    reportStore.addReport(newReport);
    return newReport;
  },

  getReports: () => {
    return reportStore.getReports();
  },

  updateReport: (id, updates) => {
    const reports = reportStore.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      reportStore.saveReports(reports);
      return reports[index];
    }
    return null;
  }
};
