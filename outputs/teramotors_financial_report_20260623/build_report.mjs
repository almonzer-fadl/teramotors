import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const raw = JSON.parse(await fs.readFile('./financial_data.json', 'utf8'));
const invoices = raw.invoices;
const payments = raw.payments;
const reportDate = new Date(raw.metadata.extractedAt);
const startDate = new Date(raw.metadata.reportStart);
const endDate = new Date(raw.metadata.reportEnd);
const outputFile = './تقرير_مالي_تيراموتورز_منذ_البداية.xlsx';

const wb = Workbook.create();
const summary = wb.worksheets.add('الملخص التنفيذي');
const monthly = wb.worksheets.add('الإيرادات الشهرية');
const details = wb.worksheets.add('تفاصيل الفواتير');
const customers = wb.worksheets.add('تحليل العملاء');
const paymentSheet = wb.worksheets.add('المدفوعات');
const checks = wb.worksheets.add('الضوابط والمصادر');
wb.comments.setSelf({ displayName: 'User' });

const C = {
  navy: '#16324F', teal: '#0F766E', orange: '#F59E0B', pale: '#E8F3F1',
  paleBlue: '#EAF0F6', green: '#16803A', red: '#B42318', gray: '#667085',
  lightGray: '#F2F4F7', white: '#FFFFFF', black: '#101828', border: '#D0D5DD',
};
const currencyFmt = '#,##0.00 "ر.س";[Red](#,##0.00) "ر.س";-';
const countFmt = '#,##0;[Red](#,##0);-';
const pctFmt = '0.0%;[Red](0.0%);-';
const dateFmt = 'yyyy-mm-dd';

function title(sheet, range, text) {
  sheet.mergeCells(range);
  const r = sheet.getRange(range);
  r.values = [[text]];
  r.format = {
    fill: C.navy,
    font: { bold: true, color: C.white, size: 18, name: 'Arial' },
    horizontalAlignment: 'right', verticalAlignment: 'center',
  };
  r.format.rowHeight = 34;
}
function section(range) {
  range.format = {
    fill: C.teal,
    font: { bold: true, color: C.white, name: 'Arial' },
    horizontalAlignment: 'right', verticalAlignment: 'center',
  };
  range.format.rowHeight = 25;
}
function header(range) {
  range.format = {
    fill: C.paleBlue,
    font: { bold: true, color: C.navy, name: 'Arial' },
    horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true,
    borders: { preset: 'outside', style: 'thin', color: C.border },
  };
  range.format.rowHeight = 30;
}
function body(range) {
  range.format = {
    font: { color: C.black, name: 'Arial', size: 10 },
    horizontalAlignment: 'right', verticalAlignment: 'center',
    borders: { insideHorizontal: { style: 'thin', color: '#EAECF0' } },
  };
}
function metaLine(sheet, row, label, value) {
  sheet.getRange(`A${row}:B${row}`).values = [[label, value]];
  sheet.getRange(`A${row}`).format = { font: { bold: true, color: C.gray, name: 'Arial' }, horizontalAlignment: 'right' };
  sheet.getRange(`B${row}`).format = { font: { color: C.black, name: 'Arial' }, horizontalAlignment: 'right' };
}
function setWidths(sheet, widths) {
  widths.forEach(([range, width]) => { sheet.getRange(range).format.columnWidth = width; });
}

// Invoice detail source sheet.
title(details, 'A1:N1', 'تفاصيل جميع الفواتير — TeraMotors Workshop');
details.getRange('A2:N2').merge();
details.getRange('A2').values = [[`الفترة: ${startDate.toISOString().slice(0,10)} إلى ${endDate.toISOString().slice(0,10)} | السياسة: تُعامل جميع الفواتير كإيراد بغض النظر عن الحالة`]];
details.getRange('A2:N2').format = { fill: C.pale, font: { color: C.teal, italic: true, name: 'Arial' }, horizontalAlignment: 'right' };
details.getRange('A5:N5').values = [[
  'رقم الفاتورة','تاريخ الفاتورة','العميل','رقم الجوال','المركبة','رقم اللوحة','أمر العمل',
  'الحالة','إيراد الخدمات','إيراد القطع','الضريبة','إجمالي الإيراد','تاريخ الاستحقاق','ملاحظات'
]];
header(details.getRange('A5:N5'));
const detailRows = invoices.map((x) => [
  x.invoiceNumber, new Date(x.invoiceDate), x.customerName, x.customerPhone, x.vehicle,
  x.plateNumber, x.jobCardNumber, x.status === 'paid' ? 'مدفوعة' : x.status === 'cancelled' ? 'ملغاة' : 'معلقة',
  x.serviceRevenue, x.partsRevenue, x.vat, x.total, x.dueDate ? new Date(x.dueDate) : null, x.notes,
]);
details.getRange(`A6:N${5 + detailRows.length}`).values = detailRows;
body(details.getRange(`A6:N${5 + detailRows.length}`));
details.getRange(`B6:B${5 + detailRows.length}`).format.numberFormat = dateFmt;
details.getRange(`I6:L${5 + detailRows.length}`).format.numberFormat = currencyFmt;
details.getRange(`M6:M${5 + detailRows.length}`).format.numberFormat = dateFmt;
details.getRange(`I6:L${5 + detailRows.length}`).format.horizontalAlignment = 'right';
details.getRange(`N6:N${5 + detailRows.length}`).format.wrapText = true;
details.tables.add(`A5:N${5 + detailRows.length}`, true, 'InvoiceDetailsTable').style = 'TableStyleMedium2';
details.freezePanes.freezeRows(5);
details.showGridLines = false;
setWidths(details, [['A:A',15],['B:B',13],['C:C',23],['D:D',16],['E:E',22],['F:F',14],['G:G',14],['H:H',12],['I:L',16],['M:M',14],['N:N',28]]);
wb.comments.addThread({ cell: details.getRange('A6') }, `المصدر: MongoDB Atlas / قاعدة teramotors / مجموعة invoices. تاريخ الاستخراج: ${reportDate.toISOString()}`);

// Monthly revenue model.
title(monthly, 'A1:G1', 'تحليل الإيرادات الشهرية');
monthly.getRange('A3:G3').values = [['الشهر','إجمالي الإيراد','عدد الفواتير','متوسط الفاتورة','الضريبة','نسبة من الإجمالي','وسم الشهر']];
header(monthly.getRange('A3:G3'));
const firstMonth = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));
const lastMonth = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
const monthDates = [];
for (let d = new Date(firstMonth); d <= lastMonth; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))) monthDates.push(new Date(d));
const mStart = 4;
const mEnd = mStart + monthDates.length - 1;
monthly.getRange(`A${mStart}:A${mEnd}`).values = monthDates.map((d) => [d]);
monthly.getRange(`A${mStart}:A${mEnd}`).format.numberFormat = 'yyyy-mm';
for (let row = mStart; row <= mEnd; row++) {
  monthly.getRange(`B${row}`).formulas = [[`=SUMIFS('تفاصيل الفواتير'!$L$6:$L$${5+detailRows.length},'تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},">="&A${row},'تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},"<"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))`]];
  monthly.getRange(`C${row}`).formulas = [[`=COUNTIFS('تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},">="&A${row},'تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},"<"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))`]];
  monthly.getRange(`D${row}`).formulas = [[`=IFERROR(B${row}/C${row},0)`]];
  monthly.getRange(`E${row}`).formulas = [[`=SUMIFS('تفاصيل الفواتير'!$K$6:$K$${5+detailRows.length},'تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},">="&A${row},'تفاصيل الفواتير'!$B$6:$B$${5+detailRows.length},"<"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))`]];
  monthly.getRange(`F${row}`).formulas = [[`=IFERROR(B${row}/SUM($B$${mStart}:$B$${mEnd}),0)`]];
  monthly.getRange(`G${row}`).formulas = [[`=TEXT(A${row},"yyyy-mm")`]];
}
body(monthly.getRange(`A${mStart}:G${mEnd}`));
monthly.getRange(`B${mStart}:E${mEnd}`).format.numberFormat = currencyFmt;
monthly.getRange(`C${mStart}:C${mEnd}`).format.numberFormat = countFmt;
monthly.getRange(`F${mStart}:F${mEnd}`).format.numberFormat = pctFmt;
const totalRow = mEnd + 2;
monthly.getRange(`A${totalRow}:F${totalRow}`).values = [['الإجمالي',null,null,null,null,null]];
monthly.getRange(`B${totalRow}`).formulas = [[`=SUM(B${mStart}:B${mEnd})`]];
monthly.getRange(`C${totalRow}`).formulas = [[`=SUM(C${mStart}:C${mEnd})`]];
monthly.getRange(`D${totalRow}`).formulas = [[`=IFERROR(B${totalRow}/C${totalRow},0)`]];
monthly.getRange(`E${totalRow}`).formulas = [[`=SUM(E${mStart}:E${mEnd})`]];
monthly.getRange(`F${totalRow}`).formulas = [['=1']];
monthly.getRange(`A${totalRow}:F${totalRow}`).format = { fill: C.navy, font: { bold: true, color: C.white, name: 'Arial' }, horizontalAlignment: 'right', borders: { preset: 'doubleBottom', style: 'medium', color: C.navy } };
monthly.getRange(`B${totalRow}:E${totalRow}`).format.numberFormat = currencyFmt;
monthly.getRange(`C${totalRow}`).format.numberFormat = countFmt;
monthly.getRange(`F${totalRow}`).format.numberFormat = pctFmt;
monthly.freezePanes.freezeRows(3);
monthly.showGridLines = false;
setWidths(monthly, [['A:A',14],['B:B',19],['C:C',15],['D:E',18],['F:F',17],['G:G',14]]);

// Customer analysis with formula-driven totals.
title(customers, 'A1:E1', 'تحليل الإيرادات حسب العميل');
customers.getRange('A3:E3').values = [['العميل','إجمالي الإيراد','عدد الفواتير','متوسط الفاتورة','الحصة من الإجمالي']];
header(customers.getRange('A3:E3'));
const customerTotals = new Map();
for (const x of invoices) customerTotals.set(x.customerName, (customerTotals.get(x.customerName) || 0) + x.total);
const customerNames = [...customerTotals.entries()].sort((a,b) => b[1]-a[1]).map(([name]) => name);
const cStart = 4, cEnd = cStart + customerNames.length - 1;
customers.getRange(`A${cStart}:A${cEnd}`).values = customerNames.map((name) => [name]);
for (let row = cStart; row <= cEnd; row++) {
  customers.getRange(`B${row}`).formulas = [[`=SUMIF('تفاصيل الفواتير'!$C$6:$C$${5+detailRows.length},A${row},'تفاصيل الفواتير'!$L$6:$L$${5+detailRows.length})`]];
  customers.getRange(`C${row}`).formulas = [[`=COUNTIF('تفاصيل الفواتير'!$C$6:$C$${5+detailRows.length},A${row})`]];
  customers.getRange(`D${row}`).formulas = [[`=IFERROR(B${row}/C${row},0)`]];
  customers.getRange(`E${row}`).formulas = [[`=IFERROR(B${row}/SUM($B$${cStart}:$B$${cEnd}),0)`]];
  customers.getRange(`F${row}`).formulas = [[`=LEFT(A${row},18)`]];
}
body(customers.getRange(`A${cStart}:E${cEnd}`));
customers.getRange(`B${cStart}:D${cEnd}`).format.numberFormat = currencyFmt;
customers.getRange(`C${cStart}:C${cEnd}`).format.numberFormat = countFmt;
customers.getRange(`E${cStart}:E${cEnd}`).format.numberFormat = pctFmt;
customers.tables.add(`A3:E${cEnd}`, true, 'CustomerRevenueTable').style = 'TableStyleMedium4';
customers.freezePanes.freezeRows(3);
customers.showGridLines = false;
setWidths(customers, [['A:A',28],['B:B',19],['C:C',15],['D:D',18],['E:E',18],['F:F',20]]);

// Payments are included for traceability only and do not alter earned revenue.
title(paymentSheet, 'A1:G1', 'سجل المدفوعات — للمرجعية فقط');
paymentSheet.getRange('A2:G2').merge();
paymentSheet.getRange('A2').values = [['لا تُستخدم حالة الدفع في احتساب الإيراد؛ جميع الفواتير مشمولة بالكامل حسب توجيه الإدارة.']];
paymentSheet.getRange('A2:G2').format = { fill: '#FFF7E6', font: { color: '#9A6700', italic: true, name: 'Arial' }, horizontalAlignment: 'right' };
paymentSheet.getRange('A4:G4').values = [['رقم الدفعة','تاريخ الدفع','رقم الفاتورة','المبلغ','الطريقة','الحالة','المرجع']];
header(paymentSheet.getRange('A4:G4'));
const paymentRows = payments.map((x) => [x.paymentNumber,new Date(x.paymentDate),x.invoiceNumber,x.amount,x.paymentMethod === 'cash' ? 'نقداً' : x.paymentMethod,x.status === 'completed' ? 'مكتملة' : x.status === 'failed' ? 'فاشلة' : x.status === 'refunded' ? 'مستردة' : 'معلقة',x.reference]);
if (paymentRows.length) {
  paymentSheet.getRange(`A5:G${4+paymentRows.length}`).values = paymentRows;
  body(paymentSheet.getRange(`A5:G${4+paymentRows.length}`));
  paymentSheet.getRange(`B5:B${4+paymentRows.length}`).format.numberFormat = dateFmt;
  paymentSheet.getRange(`D5:D${4+paymentRows.length}`).format.numberFormat = currencyFmt;
  paymentSheet.tables.add(`A4:G${4+paymentRows.length}`, true, 'PaymentsTable').style = 'TableStyleMedium2';
}
paymentSheet.freezePanes.freezeRows(4);
paymentSheet.showGridLines = false;
setWidths(paymentSheet, [['A:A',23],['B:B',14],['C:C',16],['D:D',17],['E:F',14],['G:G',20]]);

// Summary dashboard.
title(summary, 'A1:H1', 'التقرير المالي الشامل — TeraMotors Workshop');
summary.getRange('A2:H2').merge();
summary.getRange('A2').values = [[`منذ بدء استخدام التطبيق (${startDate.toISOString().slice(0,10)}) حتى ${endDate.toISOString().slice(0,10)} | العملة: الريال السعودي`]];
summary.getRange('A2:H2').format = { fill: C.paleBlue, font: { color: C.navy, name: 'Arial' }, horizontalAlignment: 'right' };
summary.getRange('A4:H4').merge(); summary.getRange('A4').values = [['مؤشرات الأداء الرئيسية']]; section(summary.getRange('A4:H4'));
summary.getRange('A6:B6').merge(); summary.getRange('C6:D6').merge(); summary.getRange('E6:F6').merge(); summary.getRange('G6:H6').merge();
summary.getRange('A6').values = [['إجمالي الإيرادات']]; summary.getRange('C6').values = [['عدد الفواتير']]; summary.getRange('E6').values = [['متوسط الفاتورة']]; summary.getRange('G6').values = [['إجمالي الضريبة']];
summary.getRange('A7:B8').merge(); summary.getRange('C7:D8').merge(); summary.getRange('E7:F8').merge(); summary.getRange('G7:H8').merge();
summary.getRange('A7').formulas = [[`=SUM('تفاصيل الفواتير'!$L$6:$L$${5+detailRows.length})`]];
summary.getRange('C7').formulas = [[`=COUNTA('تفاصيل الفواتير'!$A$6:$A$${5+detailRows.length})`]];
summary.getRange('E7').formulas = [['=IFERROR(A7/C7,0)']];
summary.getRange('G7').formulas = [[`=SUM('تفاصيل الفواتير'!$K$6:$K$${5+detailRows.length})`]];
for (const r of ['A6:B8','C6:D8','E6:F8','G6:H8']) summary.getRange(r).format = { fill: C.white, font: { color: C.navy, bold: true, name: 'Arial' }, horizontalAlignment: 'center', verticalAlignment: 'center', borders: { preset: 'outside', style: 'medium', color: C.border } };
summary.getRange('A6:H6').format.fill = C.pale;
summary.getRange('A7:H8').format.font = { color: C.teal, bold: true, size: 17, name: 'Arial' };
summary.getRange('A7:B8').format.numberFormat = currencyFmt;
summary.getRange('C7:D8').format.numberFormat = countFmt;
summary.getRange('E7:H8').format.numberFormat = currencyFmt;
summary.getRange('A10:H10').merge(); summary.getRange('A10').values = [['اتجاه الإيرادات الشهرية']]; section(summary.getRange('A10:H10'));
const revenueChart = summary.charts.add('line', { chartType: 'line', title: 'الإيرادات الشهرية (ر.س)', hasLegend: false });
const revenueSeries = revenueChart.series.add('الإيرادات');
revenueSeries.categoryFormula = `'الإيرادات الشهرية'!$G$${mStart}:$G$${mEnd}`;
revenueSeries.formula = `'الإيرادات الشهرية'!$B$${mStart}:$B$${mEnd}`;
revenueSeries.fill = C.teal;
revenueChart.title = 'الإيرادات الشهرية (ر.س)'; revenueChart.hasLegend = false;
revenueChart.xAxis = { axisType: 'textAxis', textStyle: { fontSize: 10 } };
revenueChart.yAxis = { numberFormatCode: '#,##0 "ر.س"' };
revenueChart.setPosition('A11','H26');
summary.getRange('A28:H28').merge(); summary.getRange('A28').values = [['أكبر 10 عملاء حسب الإيراد']]; section(summary.getRange('A28:H28'));
const topEnd = Math.min(cEnd, cStart + 9);
const customerChart = summary.charts.add('bar', { chartType: 'bar', title: 'أكبر 10 عملاء (ر.س)', hasLegend: false });
const customerSeries = customerChart.series.add('الإيرادات');
customerSeries.categoryFormula = `'تحليل العملاء'!$F$${cStart}:$F$${topEnd}`;
customerSeries.formula = `'تحليل العملاء'!$B$${cStart}:$B$${topEnd}`;
customerSeries.fill = C.orange;
customerChart.title = 'أكبر 10 عملاء حسب الإيراد (ر.س)'; customerChart.hasLegend = false;
customerChart.yAxis = { numberFormatCode: '#,##0 "ر.س"' };
customerChart.setPosition('A29','H48');
summary.getRange('A50:H52').merge();
summary.getRange('A50').values = [['ملاحظة محاسبية: التقرير يعرض الإيراد الإجمالي من جميع الفواتير، بغض النظر عن حالتها. لا يمثل صافي الربح لعدم توفر مصروفات التشغيل وتكلفة المخزون والرواتب بصورة مكتملة.']];
summary.getRange('A50:H52').format = { fill: '#FFF7E6', font: { color: '#7A2E0E', italic: true, name: 'Arial' }, horizontalAlignment: 'right', verticalAlignment: 'center', wrapText: true, borders: { preset: 'outside', style: 'thin', color: C.orange } };
summary.showGridLines = false;
setWidths(summary, [['A:H',16]]);

// Checks and sources.
title(checks, 'A1:G1', 'ضوابط الجودة والمصادر');
metaLine(checks, 3, 'اسم المنشأة', raw.metadata.tenantName);
metaLine(checks, 4, 'قاعدة البيانات', 'MongoDB Atlas — teramotors');
metaLine(checks, 5, 'تاريخ ووقت الاستخراج', reportDate);
checks.getRange('B5').format.numberFormat = 'yyyy-mm-dd hh:mm';
metaLine(checks, 6, 'سياسة الاعتراف بالإيراد', 'جميع الفواتير تُحتسب بالكامل بغض النظر عن الحالة');
checks.getRange('A8:G8').values = [['الفحص','القيمة الفعلية','القيمة المتوقعة','الفرق','حد السماح','الحالة','ملاحظات']];
header(checks.getRange('A8:G8'));
checks.getRange('A9:A12').values = [['مطابقة إجمالي الإيرادات'],['مطابقة عدد الفواتير'],['مطابقة مجموع الأشهر'],['اكتمال مبالغ الفواتير']];
checks.getRange('B9').formulas = [["='الملخص التنفيذي'!A7"]];
checks.getRange('C9').formulas = [[`=SUM('تفاصيل الفواتير'!$L$6:$L$${5+detailRows.length})`]];
checks.getRange('B10').formulas = [["='الملخص التنفيذي'!C7"]]; checks.getRange('C10').values = [[invoices.length]];
checks.getRange('B11').formulas = [[`=SUM('الإيرادات الشهرية'!$B$${mStart}:$B$${mEnd})`]]; checks.getRange('C11').formulas = [["='الملخص التنفيذي'!A7"]];
checks.getRange('B12').formulas = [[`=COUNT('تفاصيل الفواتير'!$L$6:$L$${5+detailRows.length})`]]; checks.getRange('C12').values = [[invoices.length]];
for (let row = 9; row <= 12; row++) {
  checks.getRange(`D${row}`).formulas = [[`=B${row}-C${row}`]];
  checks.getRange(`E${row}`).values = [[0.01]];
  checks.getRange(`F${row}`).formulas = [[`=IF(ABS(D${row})<=E${row},"سليم","مراجعة")`]];
}
checks.getRange('G9:G12').values = [['يجب أن يساوي الملخص تفاصيل الفواتير'],['جميع الفواتير الـ42 مشمولة'],['يجب أن يساوي مجموع الأشهر الإجمالي'],['لا توجد فاتورة بدون مبلغ رقمي']];
body(checks.getRange('A9:G12'));
checks.getRange('B9:E12').format.numberFormat = '#,##0.00;[Red](#,##0.00);-';
checks.getRange('F9:F12').conditionalFormats.add('containsText', { text: 'سليم', format: { fill: '#DCFCE7', font: { color: C.green, bold: true } } });
checks.getRange('F9:F12').conditionalFormats.add('containsText', { text: 'مراجعة', format: { fill: '#FEE2E2', font: { color: C.red, bold: true } } });
checks.getRange('A15:G15').merge(); checks.getRange('A15').values = [['ملاحظات المصدر والمنهجية']]; section(checks.getRange('A15:G15'));
checks.getRange('A16:G20').merge();
checks.getRange('A16').values = [[
  `المصدر: قاعدة MongoDB Atlas الخاصة بتطبيق TeraMotors، مجموعة invoices، للمستأجر ذي المعرّف teramotors. ` +
  `الفترة من ${startDate.toISOString().slice(0,10)} إلى ${endDate.toISOString().slice(0,10)}. ` +
  `تم تضمين جميع الفواتير دون استثناء بسبب الحالة. مبالغ الخدمات والقطع مستخرجة من أوامر العمل المرتبطة عند توفرها. ` +
  `المبالغ بالريال السعودي، ولم تُحتسب المصروفات أو تكلفة البضاعة المباعة أو الرواتب؛ لذلك لا يُعد الإجمالي صافي ربح.`
]];
checks.getRange('A16:G20').format = { fill: C.lightGray, font: { color: C.black, name: 'Arial' }, horizontalAlignment: 'right', verticalAlignment: 'top', wrapText: true, borders: { preset: 'outside', style: 'thin', color: C.border } };
checks.showGridLines = false;
setWidths(checks, [['A:A',27],['B:E',17],['F:F',14],['G:G',35]]);

// Global formatting for source-linked and formula cells.
for (const sheet of [summary, monthly, details, customers, paymentSheet, checks]) {
  const used = sheet.getUsedRange();
  if (used) used.format.font.name = 'Arial';
}

// Compact verification before export.
console.log((await wb.inspect({ kind: 'table', range: 'الملخص التنفيذي!A1:H10', include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 8 })).ndjson);
console.log((await wb.inspect({ kind: 'table', range: `الإيرادات الشهرية!A3:F${totalRow}`, include: 'values,formulas', tableMaxRows: 12, tableMaxCols: 7 })).ndjson);
console.log((await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A', options: { useRegex: true, maxResults: 100 }, summary: 'formula error scan' })).ndjson);

for (const [name, range, file] of [
  ['الملخص التنفيذي','A1:H52','preview_summary.png'],
  ['الإيرادات الشهرية',`A1:G${totalRow}`,'preview_monthly.png'],
  ['تفاصيل الفواتير',`A1:N${Math.min(18,5+detailRows.length)}`,'preview_invoices.png'],
  ['تحليل العملاء',`A1:E${Math.min(18,cEnd)}`,'preview_customers.png'],
  ['المدفوعات',`A1:G${Math.max(8,4+paymentRows.length)}`,'preview_payments.png'],
  ['الضوابط والمصادر','A1:G20','preview_checks.png'],
]) {
  const image = await wb.render({ sheetName: name, range, scale: 1.4, format: 'png' });
  await fs.writeFile(file, new Uint8Array(await image.arrayBuffer()));
}

const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(outputFile);
console.log(JSON.stringify({ outputFile, invoiceCount: invoices.length, totalRevenue: invoices.reduce((s,x)=>s+x.total,0), customerCount: customerNames.length }));
