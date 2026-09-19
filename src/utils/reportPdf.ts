import { jsPDF } from 'jspdf';

export interface PdfStat {
  label: string;
  value: string;
}

export interface PdfSection {
  title: string;
  lines: string[];
  highlight?: boolean;
}

export interface ReportPdfOptions {
  title: string;
  subtitle?: string;
  period?: string;
  mine?: string;
  fileName: string;
  overallCompliance?: string;
  stats: PdfStat[];
  sections: PdfSection[];
  footer?: string;
}

const NAVY: [number, number, number] = [11, 19, 43];
const BLUE: [number, number, number] = [37, 99, 235];
const PURPLE: [number, number, number] = [124, 58, 237];
const SLATE: [number, number, number] = [100, 116, 139];
const LIGHT: [number, number, number] = [241, 245, 249];
const EMERALD: [number, number, number] = [5, 150, 105];
const RED: [number, number, number] = [220, 38, 38];

const PAGE_WIDTH = 210;
const MARGIN = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const wrapLines = (doc: jsPDF, text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (doc.getTextWidth(test) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
};

export function downloadPdf(options: ReportPdfOptions): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setLineHeightFactor(1.35);

  let y = 0;

  const ensureSpace = (needed: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 28) {
      doc.addPage();
      y = 20;
    }
  };

  const header = () => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
    doc.setFillColor(...BLUE);
    doc.rect(0, 30, PAGE_WIDTH, 1.2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MineVision AI', MARGIN, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Smart Mine Governance & Compliance Platform', MARGIN, 17.5);
    doc.text('DGMS CMR 2017 Statutory Reporting', MARGIN, 21.5);

    if (options.period) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(options.period, PAGE_WIDTH - MARGIN, 12, { align: 'right' });
    }
  };

  const titleBlock = () => {
    const baseTitle = options.title.toUpperCase();
    const lines = wrapLines(doc.setFont('helvetica', 'bold').setFontSize(15), baseTitle, CONTENT_WIDTH);
    doc.setTextColor(...NAVY);
    y = 40;
    for (const line of lines) {
      ensureSpace(8);
      doc.text(line, MARGIN, y);
      y += 8;
    }

    if (options.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...SLATE);
      const subLines = wrapLines(doc, options.subtitle, CONTENT_WIDTH);
      for (const line of subLines) {
        ensureSpace(5);
        doc.text(line, MARGIN, y);
        y += 5;
      }
    }

    if (options.mine) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...BLUE);
      ensureSpace(5);
      doc.text(options.mine, MARGIN, y);
      y += 5;
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN, y + 1, PAGE_WIDTH - MARGIN, y + 1);
    y += 6;
  };

  const statsBlock = () => {
    const cols = 2;
    const rowH = 13;
    const cellH = 11;
    const gap = 3;
    const colW = (CONTENT_WIDTH - gap) / cols;
    const rows = Math.ceil(options.stats.length / cols);

    if (options.overallCompliance) {
      ensureSpace(rowH + 8);
      doc.setFillColor(...PURPLE);
      doc.roundedRect(MARGIN, y, CONTENT_WIDTH, rowH, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Overall Compliance: ${options.overallCompliance}`, MARGIN + 5, y + 7.5);
      y += rowH + 5;
    }

    ensureSpace(rows * rowH + 12);

    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('REPORT SUMMARY', MARGIN, y);
    y += 4;

    options.stats.forEach((stat, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = MARGIN + col * (colW + gap);
      const cy = y + row * rowH;

      doc.setFillColor(...LIGHT);
      doc.roundedRect(x, cy, colW, cellH, 1.5, 1.5, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...SLATE);
      doc.text(stat.label, x + 4, cy + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text(stat.value, x + 4, cy + 9);
    });

    y += rows * rowH + 6;
  };

  const sectionsBlock = () => {
    for (const section of options.sections) {
      ensureSpace(22);
      doc.setFillColor(section.highlight ? 254 : 241, section.highlight ? 242 : 245, section.highlight ? 254 : 249);
      doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 4.5, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      if (section.highlight) {
        doc.setTextColor(...RED);
      } else {
        doc.setTextColor(...BLUE);
      }
      doc.text(section.title.toUpperCase(), MARGIN, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      for (const line of section.lines) {
        const wrapped = wrapLines(doc, line, CONTENT_WIDTH - 6);
        for (const wLine of wrapped) {
          ensureSpace(5);
          if (section.highlight) {
            doc.setFillColor(254, 226, 226);
            doc.circle(MARGIN + 1.5, y - 1.2, 0.7, 'F');
          } else {
            doc.setFillColor(191, 219, 254);
            doc.circle(MARGIN + 1.5, y - 1.2, 0.7, 'F');
          }
          doc.text(wLine, MARGIN + 4.5, y);
          y += 5;
        }
      }
      y += 4;
    }
  };

  const footer = () => {
    if (options.footer) {
      const text = options.footer;
      const wrapped = wrapLines(doc.setFont('helvetica', 'italic').setFontSize(8), text, CONTENT_WIDTH);
      doc.setTextColor(...SLATE);
      const lastLine = wrapped[wrapped.length - 1];
      const textHeight = wrapped.length * 4;
      const pageHeight = doc.internal.pageSize.getHeight();
      y = Math.max(y, pageHeight - 34 - textHeight);

      for (let i = 0; i < wrapped.length; i++) {
        doc.text(wrapped[i], MARGIN, pageHeight - 28 - (wrapped.length - 1 - i) * 4);
      }
    }

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...EMERALD);
    doc.line(MARGIN, pageHeight - 18, PAGE_WIDTH - MARGIN, pageHeight - 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(
      'Digitally prepared by MineVision AI - tamper-evident DGMS audit trail. Compliance data is simulated for demonstration.',
      MARGIN,
      pageHeight - 13.5
    );
    doc.text(
      `Generated: ${new Date().toLocaleString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      PAGE_WIDTH - MARGIN,
      pageHeight - 13.5,
      { align: 'right' }
    );
    const pageCount = doc.getNumberOfPages();
    doc.text(`Page ${pageCount}`, PAGE_WIDTH - MARGIN, pageHeight - 8.5, { align: 'right' });
  };

  header();
  titleBlock();
  statsBlock();
  sectionsBlock();
  footer();

  doc.save(options.fileName.endsWith('.pdf') ? options.fileName : `${options.fileName}.pdf`);
}