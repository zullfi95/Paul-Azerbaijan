declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: { [key: string]: unknown }) => jsPDF;
  }
}
