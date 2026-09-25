export const reportStore = {
  getReports: () => {
    const stored = localStorage.getItem('tritontrace_reports');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored reports", e);
        return [];
      }
    }
    return [];
  },

  saveReports: (reports) => {
    localStorage.setItem('tritontrace_reports', JSON.stringify(reports));
  },

  addReport: (report) => {
    const reports = reportStore.getReports();
    reports.push(report);
    reportStore.saveReports(reports);
  }
};
