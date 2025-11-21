import type { Order } from '../types/common';
import { formatTotalAmount, parseTotalAmount } from './numberUtils';
import { getStatusLabel, getTranslatedStatusLabel } from './statusTranslations';

export interface BEOData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  clientName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  venue: string;
  guestCount: number;
  menuItems: {
    name: string;
    quantity: number;
    unit: string;
    price?: number;
  }[];
  specialRequests?: string;
  totalAmount?: number;
  setupTime?: string;
  serviceTime?: string;
  equipment?: string[];
  staffRequired?: string[];
}

type TranslateFunction = (key: string, values?: Record<string, string | number>) => string;

async function ensureUnicodeFont(doc: jsPDF): Promise<void> {
  try {
    // Ожидаем, что файл шрифта будет доступен по пути /fonts/Roboto-Regular.ttf (положить в public/fonts)
    const response = await fetch('/fonts/Roboto-Regular.ttf');
    if (!response.ok) return;
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    (doc as { addFileToVFS: (filename: string, data: string) => void }).addFileToVFS('Roboto-Regular.ttf', base64);
    (doc as { addFont: (filename: string, fontName: string, style: string) => void }).addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
  } catch {
    // Fallback на стандартный шрифт
    doc.setFont('helvetica');
  }
}

function formatDate(value: string | null | undefined, t: TranslateFunction, locale: string = 'ru-RU'): string {
  if (!value) return t('beo.eventInfo.notSpecified');
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(locale);
}

function formatTime(value: string | null | undefined, t: TranslateFunction, locale: string = 'ru-RU'): string {
  if (!value) return t('beo.eventInfo.notSpecified');
  // Может прийти как HH:mm или полная дата-время
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export async function generateBEOFile(order: Order, t: TranslateFunction, locale: string = 'ru-RU'): Promise<void> {
  const doc = new jsPDF();

  // Загружаем Unicode-шрифт (для кириллицы/азербайджанского)
  await ensureUnicodeFont(doc);
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 26); // #1A1A1A
  doc.text(t('beo.title'), 20, 25);
  
  doc.setFontSize(16);
  doc.text(t('beo.subtitle'), 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(74, 74, 74); // #4A4A4A
  doc.text(`${t('beo.beoNumber')}${order.id}`, 150, 25);
  doc.text(`${t('beo.createdDate')} ${new Date().toLocaleDateString(locale)}`, 150, 32);
  
  // Линия разделитель
  doc.setDrawColor(212, 175, 55); // #D4AF37
  doc.setLineWidth(1);
  doc.line(20, 45, 190, 45);
  
  let yPosition = 55;
  
  // Event Information
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(t('beo.eventInfo.title'), 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(74, 74, 74);
  
  const eventInfo = [
    [t('beo.eventInfo.company'), order.company_name || t('beo.eventInfo.notSpecified')],
    [t('beo.eventInfo.eventDate'), formatDate(order.delivery_date as string, t, locale)],
    [t('beo.eventInfo.eventTime'), formatTime(order.delivery_time as string, t, locale)],
    [t('beo.eventInfo.orderStatus'), getTranslatedStatusLabel(order.status, t)],
    [t('beo.eventInfo.orderAmount'), order.total_amount ? `${formatTotalAmount(order.total_amount)} ₼` : t('beo.eventInfo.notSpecified')]
  ];
  
  eventInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label ?? '', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value ?? '', 80, yPosition);
    yPosition += 7;
  });

  yPosition += 10;
  
  // Menu Items
  if (order.menu_items && order.menu_items.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text(t('beo.menu.title'), 20, yPosition);
    yPosition += 10;
    
    const menuData = order.menu_items.map((item, index: number) => [
      index + 1,
      item.name || t('beo.eventInfo.notSpecified'),
      item.quantity || 1,
      item.price ? `${item.price} ₼` : t('beo.menu.onRequest'),
      item.price && item.quantity ? `${(item.price * item.quantity).toFixed(2)} ₼` : t('beo.menu.onRequest')
    ]);
    
    const headers = [
      t('beo.menu.header1'),
      t('beo.menu.header2'),
      t('beo.menu.header3'),
      t('beo.menu.header4'),
      t('beo.menu.header5')
    ];
    doc.autoTable({
      startY: yPosition,
      head: [headers],
      body: menuData,
      theme: 'grid',
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [26, 26, 26],
        fontStyle: 'bold',
        fontSize: 10,
        font: 'Roboto'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [74, 74, 74],
        font: 'Roboto'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 80 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 },
      styles: { font: 'Roboto' }
    });

    // Safely update yPosition if lastAutoTable and finalY are defined
    const lastAutoTableFinalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY;
    if (typeof lastAutoTableFinalY === 'number') {
      yPosition = lastAutoTableFinalY + 15;
    }

  }
  
  // Comments Section
  const hasComments = order.kitchen_comment || order.operation_comment || order.desserts_comment || order.special_instructions;
  if (hasComments) {
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text(t('beo.comments.title'), 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(74, 74, 74);
    
    if (order.kitchen_comment) {
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text(t('beo.comments.kitchen'), 20, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setTextColor(74, 74, 74);
      const splitKitchenComment = doc.splitTextToSize(order.kitchen_comment, 170);
      doc.text(splitKitchenComment, 20, yPosition);
      yPosition += splitKitchenComment.length * 5 + 8;
    }
    
    if (order.operation_comment) {
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text(t('beo.comments.operation'), 20, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setTextColor(74, 74, 74);
      const splitOperationComment = doc.splitTextToSize(order.operation_comment, 170);
      doc.text(splitOperationComment, 20, yPosition);
      yPosition += splitOperationComment.length * 5 + 8;
    }
    
    if (order.desserts_comment) {
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text(t('beo.comments.desserts'), 20, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setTextColor(74, 74, 74);
      const splitDessertsComment = doc.splitTextToSize(order.desserts_comment, 170);
      doc.text(splitDessertsComment, 20, yPosition);
      yPosition += splitDessertsComment.length * 5 + 8;
    }
    
    if (order.special_instructions) {
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text(t('beo.comments.special'), 20, yPosition);
      yPosition += 6;
      doc.setFontSize(10);
      doc.setTextColor(74, 74, 74);
      const splitSpecialInstructions = doc.splitTextToSize(order.special_instructions, 170);
      doc.text(splitSpecialInstructions, 20, yPosition);
      yPosition += splitSpecialInstructions.length * 5 + 8;
    }
    
    yPosition += 5;
  }
  
  // Service Details Section
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(t('beo.service.title'), 20, yPosition);
  yPosition += 10;
  
  const serviceDetails = [
    [t('beo.service.prepTime'), t('beo.service.prepTimeValue')],
    [t('beo.service.serviceTime'), order.delivery_time ? formatTime(order.delivery_time, t, locale) : t('beo.service.serviceTimeDefault')],
    [t('beo.service.serviceType'), t('beo.service.serviceTypeValue')],
    [t('beo.service.staffRequired'), t('beo.service.staffRequiredValue')],
    [t('beo.service.equipment'), t('beo.service.equipmentValue')]
  ];
  
  doc.setFontSize(10);
  serviceDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 7;
  });
  
  yPosition += 15;
  
  // Footer with signatures
  doc.setDrawColor(212, 175, 55);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(74, 74, 74);
  
  // Signature sections
  doc.text(t('beo.signatures.manager'), 20, yPosition);
  doc.text('_____________________', 20, yPosition + 7);
  doc.text(t('beo.signatures.date'), 20, yPosition + 14);
  
  doc.text(t('beo.signatures.chef'), 110, yPosition);
  doc.text('_____________________', 110, yPosition + 7);
  doc.text(t('beo.signatures.date'), 110, yPosition + 14);
  
  yPosition += 25;
  
  // Contact information
  doc.setFontSize(8);
  doc.setTextColor(123, 94, 59); // #7B5E3B
  doc.text(t('beo.contact.info'), 20, yPosition);
  doc.text(t('beo.contact.address'), 20, yPosition + 5);
  
  // Save the PDF
  const fileName = `BEO_${order.company_name}_${order.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}



// Функция для генерации отчета по заказам за период
export function generateOrdersReport(orders: Order[], startDate: Date, endDate: Date, t: TranslateFunction, locale: string = 'ru-RU'): void {
  const doc = new jsPDF();
  
  doc.setFont('helvetica');
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 26);
  doc.text(t('beo.title'), 20, 25);
  
  doc.setFontSize(16);
  doc.text(t('beo.report.title'), 20, 35);
  
  doc.setFontSize(12);
  doc.setTextColor(74, 74, 74);
  doc.text(`${t('beo.report.period')} ${startDate.toLocaleDateString(locale)} - ${endDate.toLocaleDateString(locale)}`, 20, 45);
  doc.text(`${t('beo.createdDate')} ${new Date().toLocaleDateString(locale)}`, 150, 25);
  
  let yPosition = 60;
  
  // Statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalAmount = orders.reduce((sum, order) => sum + parseTotalAmount(order.total_amount), 0);
  
  doc.setFontSize(14);
  doc.setTextColor(26, 26, 26);
  doc.text(t('beo.report.statistics.title'), 20, yPosition);
  yPosition += 10;
  
  const stats = [
    [t('beo.report.statistics.totalOrders'), totalOrders.toString()],
    [t('beo.report.statistics.completedOrders'), completedOrders.toString()],
    [t('beo.report.statistics.totalAmount'), `${totalAmount.toFixed(2)} ₼`],
    [t('beo.report.statistics.averageCheck'), totalOrders > 0 ? `${(totalAmount / totalOrders).toFixed(2)} ₼` : '0 ₼']
  ];
  
  doc.setFontSize(10);
  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Orders table
  if (orders.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text(t('beo.report.ordersList.title'), 20, yPosition);
    yPosition += 10;
    
    const orderData = orders.map(order => [
      order.id.toString(),
      order.company_name || t('beo.eventInfo.notSpecified'),
      formatDate(order.delivery_date as string, t, locale),
      getTranslatedStatusLabel(order.status, t),
      order.total_amount ? `${formatTotalAmount(order.total_amount)} ₼` : t('beo.eventInfo.notSpecified')
    ]);
    
    const headers = [
      t('beo.report.ordersList.header1'),
      t('beo.report.ordersList.header2'),
      t('beo.report.ordersList.header3'),
      t('beo.report.ordersList.header4'),
      t('beo.report.ordersList.header5')
    ];
    doc.autoTable({
      startY: yPosition,
      head: [headers],
      body: orderData,
      theme: 'grid',
      headStyles: {
        fillColor: [212, 175, 55],
        textColor: [26, 26, 26],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [74, 74, 74]
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Save the PDF
  const fileName = `Orders_Report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
