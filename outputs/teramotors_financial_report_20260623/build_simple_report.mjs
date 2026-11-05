import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const raw = JSON.parse(await fs.readFile('./financial_data.json', 'utf8'));
const invoices = raw.invoices;
const outputFile = './تقرير_مالي_مختصر_TeraMotors.xlsx';
const wb = Workbook.create();
const sheet = wb.worksheets.add('التقرير المالي');

const money = '#,##0.00 "ر.س";[Red](#,##0.00) "ر.س";-';
const dateFmt = 'yyyy-mm-dd';
const lastDetailRow = 47 + invoices.length;

sheet.showGridLines = false;
sheet.freezePanes.freezeRows(4);

sheet.mergeCells('A1:H1');
sheet.getRange('A1').values = [['التقرير المالي — TeraMotors Workshop']];
sheet.getRange('A1:H1').format = {
  font: { bold: true, color: '#000000', size: 16, name: 'Arial' },
  horizontalAlignment: 'right', verticalAlignment: 'center',
  borders: { bottom: { style: 'medium', color: '#000000' } },
};
sheet.getRange('A1:H1').format.rowHeight = 32;

sheet.getRange('A3').values = [['إجمالي الإيرادات']];
sheet.getRange('B3').formulas = [[`=SUM(H48:H${lastDetailRow})`]];
sheet.getRange('A3:B3').format = {
  font: { bold: true, color: '#000000', size: 14, name: 'Arial' },
  horizontalAlignment: 'right',
  borders: { bottom: { style: 'double', color: '#000000' } },
};
sheet.getRange('B3').format.numberFormat = money;

function sectionTitle(row, text) {
  sheet.mergeCells(`A${row}:H${row}`);
  sheet.getRange(`A${row}`).values = [[text]];
  sheet.getRange(`A${row}:H${row}`).format = {
    font: { bold: true, color: '#000000', size: 12, name: 'Arial' },
    horizontalAlignment: 'right',
    borders: { bottom: { style: 'medium', color: '#000000' } },
  };
}
function header(range) {
  range.format = {
    font: { bold: true, color: '#000000', name: 'Arial' },
    horizontalAlignment: 'right', verticalAlignment: 'center', wrapText: true,
    borders: { preset: 'all', style: 'thin', color: '#808080' },
  };
}
function body(range) {
  range.format = {
    font: { color: '#000000', name: 'Arial', size: 10 },
    horizontalAlignment: 'right', verticalAlignment: 'center',
    borders: { insideHorizontal: { style: 'thin', color: '#C0C0C0' } },
  };
}

// Monthly breakdown.
sectionTitle(5, 'الإيرادات حسب الشهر');
sheet.getRange('A6:C6').values = [['الشهر','الإيرادات','عدد الفواتير']];
header(sheet.getRange('A6:C6'));
const start = new Date(raw.metadata.reportStart);
const end = new Date(raw.metadata.reportEnd);
const months = [];
for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)); d <= end; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+1, 1))) months.push(new Date(d));
months.forEach((month, i) => {
  const row = 7 + i;
  sheet.getRange(`A${row}`).values = [[month]];
  sheet.getRange(`B${row}`).formulas = [[`=SUMIFS($H$48:$H$${lastDetailRow},$B$48:$B$${lastDetailRow},">="&A${row},$B$48:$B$${lastDetailRow},"<"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))`]];
  sheet.getRange(`C${row}`).formulas = [[`=COUNTIFS($B$48:$B$${lastDetailRow},">="&A${row},$B$48:$B$${lastDetailRow},"<"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))`]];
});
const monthEnd = 6 + months.length;
body(sheet.getRange(`A7:C${monthEnd}`));
sheet.getRange(`A7:A${monthEnd}`).format.numberFormat = 'yyyy-mm';
sheet.getRange(`B7:B${monthEnd}`).format.numberFormat = money;
sheet.getRange(`C7:C${monthEnd}`).format.numberFormat = '#,##0';

// Customer breakdown.
sectionTitle(12, 'الإيرادات حسب العميل');
sheet.getRange('A13:C13').values = [['العميل','الإيرادات','عدد الفواتير']];
header(sheet.getRange('A13:C13'));
const customerTotals = new Map();
for (const invoice of invoices) customerTotals.set(invoice.customerName, (customerTotals.get(invoice.customerName) || 0) + invoice.total);
const customerNames = [...customerTotals.entries()].sort((a,b) => b[1]-a[1]).map(([name]) => name);
customerNames.forEach((name, i) => {
  const row = 14 + i;
  sheet.getRange(`A${row}`).values = [[name]];
  sheet.getRange(`B${row}`).formulas = [[`=SUMIF($C$48:$C$${lastDetailRow},A${row},$H$48:$H$${lastDetailRow})`]];
  sheet.getRange(`C${row}`).formulas = [[`=COUNTIF($C$48:$C$${lastDetailRow},A${row})`]];
});
const customerEnd = 13 + customerNames.length;
body(sheet.getRange(`A14:C${customerEnd}`));
sheet.getRange(`B14:B${customerEnd}`).format.numberFormat = money;
sheet.getRange(`C14:C${customerEnd}`).format.numberFormat = '#,##0';

// Invoice detail.
sectionTitle(46, 'تفاصيل الفواتير');
sheet.getRange('A47:H47').values = [['رقم الفاتورة','التاريخ','العميل','المركبة','الخدمات','القطع','الضريبة','الإجمالي']];
header(sheet.getRange('A47:H47'));
const rows = invoices.map((x) => [
  x.invoiceNumber,
  new Date(x.invoiceDate),
  x.customerName,
  x.vehicle,
  x.serviceRevenue,
  x.partsRevenue,
  x.vat,
  x.total,
]);
sheet.getRange(`A48:H${lastDetailRow}`).values = rows;
body(sheet.getRange(`A48:H${lastDetailRow}`));
sheet.getRange(`B48:B${lastDetailRow}`).format.numberFormat = dateFmt;
sheet.getRange(`E48:H${lastDetailRow}`).format.numberFormat = money;

// Restrained widths and readable alignment.
sheet.getRange('A:A').format.columnWidth = 23;
sheet.getRange('B:B').format.columnWidth = 17;
sheet.getRange('C:C').format.columnWidth = 28;
sheet.getRange('D:D').format.columnWidth = 24;
sheet.getRange('E:H').format.columnWidth = 17;

console.log((await wb.inspect({ kind: 'table', range: 'التقرير المالي!A1:H20', include: 'values,formulas', tableMaxRows: 20, tableMaxCols: 8 })).ndjson);
console.log((await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'formula error scan' })).ndjson);

for (const [range, name] of [['A1:H11','simple_top.png'],['A12:H45','simple_clients.png'],[`A46:H${lastDetailRow}`,'simple_details.png']]) {
  const preview = await wb.render({ sheetName: 'التقرير المالي', range, scale: 1.3, format: 'png' });
  await fs.writeFile(name, new Uint8Array(await preview.arrayBuffer()));
}

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputFile);
console.log(JSON.stringify({ outputFile, total: invoices.reduce((s,x) => s+x.total,0), invoiceCount: invoices.length }));
