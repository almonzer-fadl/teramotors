import { MongoClient, ObjectId } from "mongodb";
import XLSX from "xlsx";
import { writeFile, mkdir } from "fs/promises";
import { homedir } from "os";
import path from "path";

const URI = "mongodb+srv://valmonzer_db_user:ZcoD12es8EzPOikq@cluster0.graoqwx.mongodb.net/?appName=Cluster0";
const DB_NAME = "teramotors";
const OUT_DIR = path.resolve("teramotors-backup");

const collectionsWithTenant = [
  "customers", "vehicles", "appointments", "jobcards",
  "invoices", "estimates", "payments", "parts", "services",
  "vehicleinspections", "inspectiontemplates", "users",
  "tenantconfigs", "worklogs", "whatsappmessages"
];

// Arabic RTL column names
const ar = {
  // Common
  "ID": "المعرف",
  "Status": "الحالة",
  "Notes": "ملاحظات",
  "Created": "تاريخ الإنشاء",
  "Updated": "تاريخ التحديث",
  "Active": "نشط",
  "Yes": "نعم",
  "No": "لا",
  "Priority": "الأولوية",
  "Description": "الوصف",
  "Category": "الفئة",
  "Amount": "المبلغ",
  "Method": "طريقة الدفع",
  "Date": "التاريخ",
  "Price": "السعر",
  "Quantity": "الكمية",
  "VIN": "رقم الشاصي",
  "Name": "الاسم",
  "Email": "البريد الإلكتروني",
  "Phone": "الهاتف",
  "Plan": "الباقة",
  "Role": "الدور",
  "Supplier": "المورد",
  "Company": "الشركة",

  // Customers
  "First Name": "الاسم الأول",
  "Last Name": "الاسم الأخير",
  "Street": "الشارع",
  "City": "المدينة",
  "State": "المنطقة",
  "Zip Code": "الرمز البريدي",
  "Country": "الدولة",
  "VAT ID": "الرقم الضريبي",
  "National ID": "رقم الهوية",

  // Vehicles
  "Owner": "المالك",
  "Owner Phone": "هاتف المالك",
  "Make": "الشركة المصنعة",
  "Model": "الموديل",
  "Year": "السنة",
  "Color": "اللون",
  "License Plate": "رقم اللوحة",
  "Mileage": "العداد",
  "Engine Type": "نوع المحرك",
  "Transmission": "ناقل الحركة",
  "Fuel Type": "نوع الوقود",
  "Vehicle Color": "لون المركبة",

  // Invoices
  "Invoice #": "رقم الفاتورة",
  "Customer": "العميل",
  "Customer Phone": "هاتف العميل",
  "Customer Email": "بريد العميل",
  "Vehicle": "المركبة",
  "Job Card": "أمر الشغل",
  "Inspection Invoice": "فاتورة فحص",
  "Total Amount": "المبلغ الإجمالي",
  "Paid Amount": "المبلغ المدفوع",
  "Due Date": "تاريخ الاستحقاق",
  "Payment Method": "طريقة الدفع",

  // Job Cards
  "Job Card #": "رقم أمر الشغل",
  "Assigned To": "مسند إلى",
  "Mileage In": "العداد عند الإدخال",

  // Estimates
  "Estimate #": "رقم التقدير",
  "Services": "الخدمات",
  "Parts": "الأجزاء",

  // Payments
  "Payment #": "رقم الدفعة",
  "Invoice": "الفاتورة",

  // Appointments
  "Title": "العنوان",
  "Start Time": "وقت البداية",
  "End Time": "وقت النهاية",

  // Services
  "Code": "الكود",
  "Duration (min)": "المدة (دقيقة)",

  // Parts
  "Part Number": "رقم القطعة",
  "Min Quantity": "الحد الأدنى",
  "Cost": "التكلفة",

  // Users
  "First Name": "الاسم الأول",
  "Last Name": "الاسم الأخير",

  // Inspections
  "Inspection #": "رقم الفحص",
  "Template": "القالب",
  "Created By": "أنشئ بواسطة",

  // Tenant
  "Slug": "المعرف",

  // WhatsApp
  "Direction": "الاتجاه",
  "Message": "الرسالة",
  "From/To": "من/إلى",

  // Summary
  "Collection": "الجدول",
  "Records": "عدد السجلات",
  "TOTAL": "المجموع",
};

function tr(key) {
  return ar[key] || key;
}

async function loadAllTenantData(db, tenantOid) {
  return {
    customers: await db.collection("customers").find({ tenantId: tenantOid }).toArray(),
    vehicles: await db.collection("vehicles").find({ tenantId: tenantOid }).toArray(),
    users: await db.collection("users").find({ tenantId: tenantOid }).toArray(),
    parts: await db.collection("parts").find({ tenantId: tenantOid }).toArray(),
    services: await db.collection("services").find({ tenantId: tenantOid }).toArray(),
    jobcards: await db.collection("jobcards").find({ tenantId: tenantOid }).toArray(),
    estimates: await db.collection("estimates").find({ tenantId: tenantOid }).toArray(),
    invoices: await db.collection("invoices").find({ tenantId: tenantOid }).toArray(),
    appointments: await db.collection("appointments").find({ tenantId: tenantOid }).toArray(),
    inspections: await db.collection("vehicleinspections").find({ tenantId: tenantOid }).toArray(),
    templates: await db.collection("inspectiontemplates").find({ tenantId: tenantOid }).toArray(),
    payments: await db.collection("payments").find({ tenantId: tenantOid }).toArray(),
  };
}

function buildIdMap(records, getLabel) {
  const map = {};
  for (const r of records) {
    map[r._id.toString()] = getLabel(r);
  }
  return map;
}

function formatDate(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().split("T")[0];
}

function formatDateTime(d) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().replace("T", " ").replace(/\.\d+Z/, "");
}

async function main() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DB_NAME);

  console.log("Connected. Finding tenant with the most data...\n");

  const tenantScores = {};
  for (const colName of collectionsWithTenant) {
    try {
      const cursor = db.collection(colName).aggregate([{ $group: { _id: "$tenantId", count: { $sum: 1 } } }]);
      for await (const row of cursor) {
        if (row._id) {
          const tid = row._id.toString();
          if (!tenantScores[tid]) tenantScores[tid] = { total: 0 };
          tenantScores[tid].total += row.count;
        }
      }
    } catch (_) {}
  }

  if (Object.keys(tenantScores).length === 0) {
    console.log("No tenants found.");
    await client.close();
    return;
  }

  const tenantsCol = db.collection("tenants");
  const allTenants = await tenantsCol.find({}).toArray();
  const tenantNameMap = {};
  for (const t of allTenants) tenantNameMap[t._id.toString()] = t.name || t.businessName || t.slug || t._id.toString();

  const sorted = Object.entries(tenantScores).sort((a, b) => b[1].total - a[1].total);

  const [topTenantId] = sorted[0];
  const topName = tenantNameMap[topTenantId] || topTenantId;
  const tenantOid = new ObjectId(topTenantId);

  console.log(`Loading all data for "${topName}"...\n`);
  const d = await loadAllTenantData(db, tenantOid);

  const customerName = buildIdMap(d.customers, c => `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email || "");
  const customerPhone = buildIdMap(d.customers, c => c.phone || "");
  const customerEmail = buildIdMap(d.customers, c => c.email || "");
  const vehicleLabel = buildIdMap(d.vehicles, v => `${v.make || ""} ${v.model || ""} (${v.year || ""})`.trim());
  const vehiclePlate = buildIdMap(d.vehicles, v => v.licensePlate || "");
  const vehicleVIN = buildIdMap(d.vehicles, v => v.vin || "");
  const vehicleColor = buildIdMap(d.vehicles, v => v.color || "");
  const userName = buildIdMap(d.users, u => `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "");
  const partName = buildIdMap(d.parts, p => `${p.name || ""} (${p.partNumber || ""})`.trim());
  const serviceName = buildIdMap(d.services, s => s.name || s.code || "");
  const jobCardNum = buildIdMap(d.jobcards, j => j.jobCardNumber || "");
  const estimateNum = buildIdMap(d.estimates, e => e.estimateNumber || "");
  const invoiceNum = buildIdMap(d.invoices, i => i.invoiceNumber || "");
  const templateName = buildIdMap(d.templates, t => t.name || "");

  console.log("Building Arabic RTL spreadsheet...\n");
  await mkdir(OUT_DIR, { recursive: true });
  const workbook = XLSX.utils.book_new();
  const summaryRows = [];

  // ==== العملاء ====
  if (d.customers.length) {
    const rows = d.customers.map(c => ({
      [tr("ID")]: c._id.toString(),
      [tr("First Name")]: c.firstName || "",
      [tr("Last Name")]: c.lastName || "",
      [tr("Email")]: c.email || "",
      [tr("Phone")]: c.phone || "",
      [tr("Street")]: c.address?.street || "",
      [tr("City")]: c.address?.city || "",
      [tr("State")]: c.address?.state || "",
      [tr("Zip Code")]: c.address?.zipCode || "",
      [tr("Country")]: c.address?.country || "",
      [tr("Company")]: c.company || "",
      [tr("VAT ID")]: c.vatId || "",
      [tr("National ID")]: c.nationalId || "",
      [tr("Notes")]: c.notes || "",
      [tr("Created")]: formatDateTime(c.createdAt),
      [tr("Updated")]: formatDateTime(c.updatedAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "العملاء");
    summaryRows.push({ [tr("Collection")]: "العملاء", [tr("Records")]: rows.length });
    console.log(`  ✓ العملاء — ${rows.length}`);
  }

  // ==== Vehicles ====
  if (d.vehicles.length) {
    const rows = d.vehicles.map(v => ({
      [tr("ID")]: v._id.toString(),
      [tr("Owner")]: customerName[v.customerId?.toString()] || v.customerId || "",
      [tr("Owner Phone")]: customerPhone[v.customerId?.toString()] || "",
      [tr("Make")]: v.make || "",
      [tr("Model")]: v.model || "",
      [tr("Year")]: v.year || "",
      [tr("Color")]: v.color || "",
      [tr("License Plate")]: v.licensePlate || "",
      [tr("VIN")]: v.vin || "",
      [tr("Mileage")]: v.mileage || "",
      [tr("Engine Type")]: v.engineType || "",
      [tr("Transmission")]: v.transmission || "",
      [tr("Fuel Type")]: v.fuelType || "",
      [tr("Notes")]: v.notes || "",
      [tr("Created")]: formatDateTime(v.createdAt),
      [tr("Updated")]: formatDateTime(v.updatedAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "المركبات");
    summaryRows.push({ [tr("Collection")]: "المركبات", [tr("Records")]: rows.length });
    console.log(`  ✓ المركبات — ${rows.length}`);
  }

  // ==== Invoices ====
  if (d.invoices.length) {
    const rows = d.invoices.map(inv => {
      const cid = inv.customerId?.toString();
      const vid = inv.vehicleId?.toString();
      return {
        [tr("Invoice #")]: inv.invoiceNumber || "",
        [tr("ID")]: inv._id.toString(),
        [tr("Status")]: inv.status || "",
        [tr("Customer")]: customerName[cid] || cid || "",
        [tr("Customer Phone")]: customerPhone[cid] || "",
        [tr("Customer Email")]: customerEmail[cid] || "",
        [tr("Vehicle")]: vehicleLabel[vid] || vid || "",
        [tr("License Plate")]: vehiclePlate[vid] || "",
        [tr("VIN")]: vehicleVIN[vid] || "",
        [tr("Vehicle Color")]: vehicleColor[vid] || "",
        [tr("Job Card")]: jobCardNum[inv.jobCardId?.toString()] || inv.jobCardId || "",
        [tr("Inspection Invoice")]: inv.isInspectionInvoice ? "نعم" : "لا",
        [tr("Total Amount")]: inv.totalAmount || "",
        [tr("Paid Amount")]: inv.paidAmount || "",
        [tr("Due Date")]: formatDate(inv.dueDate),
        [tr("Payment Method")]: inv.paymentMethod || "",
        [tr("Notes")]: inv.notes || "",
        [tr("Created")]: formatDateTime(inv.createdAt),
        [tr("Updated")]: formatDateTime(inv.updatedAt),
      };
    });
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "الفواتير");
    summaryRows.push({ [tr("Collection")]: "الفواتير", [tr("Records")]: rows.length });
    console.log(`  ✓ الفواتير — ${rows.length}`);
  }

  // ==== Job Cards ====
  if (d.jobcards.length) {
    const rows = d.jobcards.map(jc => {
      const cid = jc.customerId?.toString();
      const vid = jc.vehicleId?.toString();
      return {
        [tr("Job Card #")]: jc.jobCardNumber || "",
        [tr("ID")]: jc._id.toString(),
        [tr("Status")]: jc.status || "",
        [tr("Priority")]: jc.priority || "",
        [tr("Customer")]: customerName[cid] || cid || "",
        [tr("Customer Phone")]: customerPhone[cid] || "",
        [tr("Vehicle")]: vehicleLabel[vid] || vid || "",
        [tr("License Plate")]: vehiclePlate[vid] || "",
        [tr("VIN")]: vehicleVIN[vid] || "",
        [tr("Mileage")]: jc.mileage || "",
        [tr("Assigned To")]: userName[jc.assignedTo?.toString()] || jc.assignedTo || "",
        [tr("Description")]: jc.description || "",
        [tr("Notes")]: jc.notes || "",
        [tr("Created")]: formatDateTime(jc.createdAt),
        [tr("Updated")]: formatDateTime(jc.updatedAt),
      };
    });
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "أوامر الشغل");
    summaryRows.push({ [tr("Collection")]: "أوامر الشغل", [tr("Records")]: rows.length });
    console.log(`  ✓ أوامر الشغل — ${rows.length}`);
  }

  // ==== Estimates ====
  if (d.estimates.length) {
    const rows = d.estimates.map(e => {
      const cid = e.customerId?.toString();
      const vid = e.vehicleId?.toString();
      let servicesList = "";
      if (e.services && Array.isArray(e.services)) {
        servicesList = e.services.map(s => {
          const sid = s.serviceId?.toString?.() || s._id?.toString?.() || s;
          return serviceName[sid] || sid || "";
        }).filter(Boolean).join(", ");
      }
      let partsList = "";
      if (e.parts && Array.isArray(e.parts)) {
        partsList = e.parts.map(p => {
          const pid = p.partId?.toString?.() || p._id?.toString?.() || p;
          return partName[pid] || pid || "";
        }).filter(Boolean).join(", ");
      }
      return {
        [tr("Estimate #")]: e.estimateNumber || "",
        [tr("ID")]: e._id.toString(),
        [tr("Status")]: e.status || "",
        [tr("Customer")]: customerName[cid] || cid || "",
        [tr("Customer Phone")]: customerPhone[cid] || "",
        [tr("Vehicle")]: vehicleLabel[vid] || vid || "",
        [tr("License Plate")]: vehiclePlate[vid] || "",
        [tr("VIN")]: vehicleVIN[vid] || "",
        [tr("Services")]: servicesList,
        [tr("Parts")]: partsList,
        [tr("Total Amount")]: e.totalAmount || "",
        [tr("Notes")]: e.notes || "",
        [tr("Created")]: formatDateTime(e.createdAt),
        [tr("Updated")]: formatDateTime(e.updatedAt),
      };
    });
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "التقديرات");
    summaryRows.push({ [tr("Collection")]: "التقديرات", [tr("Records")]: rows.length });
    console.log(`  ✓ التقديرات — ${rows.length}`);
  }

  // ==== Payments ====
  if (d.payments.length) {
    const rows = d.payments.map(p => ({
      [tr("Payment #")]: p.paymentNumber || "",
      [tr("ID")]: p._id.toString(),
      [tr("Amount")]: p.amount || "",
      [tr("Method")]: p.paymentMethod || "",
      [tr("Invoice")]: invoiceNum[p.invoiceId?.toString()] || p.invoiceId || "",
      [tr("Customer")]: customerName[p.customerId?.toString()] || p.customerId || "",
      [tr("Date")]: formatDate(p.date || p.paymentDate),
      [tr("Notes")]: p.notes || "",
      [tr("Created")]: formatDateTime(p.createdAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "المدفوعات");
    summaryRows.push({ [tr("Collection")]: "المدفوعات", [tr("Records")]: rows.length });
    console.log(`  ✓ المدفوعات — ${rows.length}`);
  }

  // ==== Services ====
  if (d.services.length) {
    const rows = d.services.map(s => ({
      [tr("ID")]: s._id.toString(),
      [tr("Name")]: s.name || "",
      [tr("Code")]: s.code || "",
      [tr("Description")]: s.description || "",
      [tr("Price")]: s.price || "",
      [tr("Category")]: s.category || "",
      [tr("Duration (min)")]: s.duration || "",
      [tr("Active")]: s.isActive !== false ? "نعم" : "لا",
      [tr("Created")]: formatDateTime(s.createdAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "الخدمات");
    summaryRows.push({ [tr("Collection")]: "الخدمات", [tr("Records")]: rows.length });
    console.log(`  ✓ الخدمات — ${rows.length}`);
  }

  // ==== Parts ====
  if (d.parts.length) {
    const rows = d.parts.map(p => ({
      [tr("ID")]: p._id.toString(),
      [tr("Name")]: p.name || "",
      [tr("Part Number")]: p.partNumber || "",
      [tr("Description")]: p.description || "",
      [tr("Price")]: p.price || p.cost || "",
      [tr("Quantity")]: p.quantity || p.stock || "",
      [tr("Min Quantity")]: p.minQuantity || "",
      [tr("Category")]: p.category || "",
      [tr("Supplier")]: p.supplier || "",
      [tr("Active")]: p.isActive !== false ? "نعم" : "لا",
      [tr("Created")]: formatDateTime(p.createdAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "قطع الغيار");
    summaryRows.push({ [tr("Collection")]: "قطع الغيار", [tr("Records")]: rows.length });
    console.log(`  ✓ قطع الغيار — ${rows.length}`);
  }

  // ==== Users ====
  if (d.users.length) {
    const rows = d.users.map(u => ({
      [tr("ID")]: u._id.toString(),
      [tr("First Name")]: u.firstName || "",
      [tr("Last Name")]: u.lastName || "",
      [tr("Email")]: u.email || "",
      [tr("Role")]: u.role || "",
      [tr("Active")]: u.isActive !== false ? "نعم" : "لا",
      [tr("Created")]: formatDateTime(u.createdAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "المستخدمين");
    summaryRows.push({ [tr("Collection")]: "المستخدمين", [tr("Records")]: rows.length });
    console.log(`  ✓ المستخدمين — ${rows.length}`);
  }

  // ==== Inspections ====
  if (d.inspections.length) {
    const rows = d.inspections.map(ins => ({
      [tr("Inspection #")]: ins.inspectionNumber || "",
      [tr("ID")]: ins._id.toString(),
      [tr("Status")]: ins.status || "",
      [tr("Customer")]: customerName[ins.customerId?.toString()] || ins.customerId || "",
      [tr("Vehicle")]: vehicleLabel[ins.vehicleId?.toString()] || ins.vehicleId || "",
      [tr("License Plate")]: vehiclePlate[ins.vehicleId?.toString()] || "",
      [tr("VIN")]: vehicleVIN[ins.vehicleId?.toString()] || "",
      [tr("Template")]: templateName[ins.templateId?.toString()] || ins.templateId || "",
      [tr("Created By")]: userName[ins.createdBy?.toString()] || ins.createdBy || "",
      [tr("Created")]: formatDateTime(ins.createdAt),
      [tr("Updated")]: formatDateTime(ins.updatedAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "الفحوصات");
    summaryRows.push({ [tr("Collection")]: "الفحوصات", [tr("Records")]: rows.length });
    console.log(`  ✓ الفحوصات — ${rows.length}`);
  }

  // ==== Appointments ====
  if (d.appointments.length) {
    const rows = d.appointments.map(a => ({
      [tr("ID")]: a._id.toString(),
      [tr("Title")]: a.title || "",
      [tr("Customer")]: customerName[a.customerId?.toString()] || a.customerId || "",
      [tr("Customer Phone")]: customerPhone[a.customerId?.toString()] || "",
      [tr("Vehicle")]: vehicleLabel[a.vehicleId?.toString()] || a.vehicleId || "",
      [tr("License Plate")]: vehiclePlate[a.vehicleId?.toString()] || "",
      [tr("Date")]: formatDate(a.date),
      [tr("Start Time")]: a.startTime || "",
      [tr("End Time")]: a.endTime || "",
      [tr("Status")]: a.status || "",
      [tr("Notes")]: a.notes || "",
      [tr("Created")]: formatDateTime(a.createdAt),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "المواعيد");
    summaryRows.push({ [tr("Collection")]: "المواعيد", [tr("Records")]: rows.length });
    console.log(`  ✓ المواعيد — ${rows.length}`);
  }

  // ==== Tenant ====
  const tenantDoc = await db.collection("tenants").findOne({ _id: tenantOid });
  if (tenantDoc) {
    const rows = [{
      [tr("ID")]: tenantDoc._id.toString(),
      [tr("Name")]: tenantDoc.name || tenantDoc.businessName || "",
      [tr("Slug")]: tenantDoc.slug || "",
      [tr("Email")]: tenantDoc.email || "",
      [tr("Phone")]: tenantDoc.phone || "",
      [tr("Plan")]: tenantDoc.plan || tenantDoc.subscriptionTier || "",
      [tr("Status")]: tenantDoc.status || "",
      [tr("Created")]: formatDateTime(tenantDoc.createdAt),
    }];
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "المستأجر");
    summaryRows.push({ [tr("Collection")]: "المستأجر", [tr("Records")]: rows.length });
    console.log(`  ✓ المستأجر — 1`);
  }

  // ==== WhatsApp ====
  const waMsgs = await db.collection("whatsappmessages").find({ tenantId: tenantOid }).toArray();
  if (waMsgs.length) {
    const rows = waMsgs.map(w => ({
      [tr("ID")]: w._id.toString(),
      [tr("Customer")]: customerName[w.customerId?.toString()] || w.customerId || "",
      [tr("Direction")]: w.direction || "",
      [tr("Message")]: (w.body || w.message || "").slice(0, 500),
      [tr("Status")]: w.status || "",
      [tr("From/To")]: w.from || w.to || "",
      [tr("Date")]: formatDateTime(w.createdAt || w.timestamp),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, "واتساب");
    summaryRows.push({ [tr("Collection")]: "واتساب", [tr("Records")]: rows.length });
    console.log(`  ✓ واتساب — ${rows.length}`);
  }

  // ==== Summary ====
  summaryRows.sort((a, b) => b[tr("Records")] - a[tr("Records")]);
  const totalRecords = summaryRows.reduce((sum, r) => sum + r[tr("Records")], 0);
  summaryRows.push({ [tr("Collection")]: tr("TOTAL"), [tr("Records")]: totalRecords });
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows, { header: [tr("Collection"), tr("Records")] });
  XLSX.utils.book_append_sheet(workbook, summarySheet, "الملخص");

  const safeName = topName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeName}_backup_AR.xlsx`;
  const filePath = path.join(OUT_DIR, filename);
  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  await writeFile(filePath, buf);

  const downloadsPath = path.join(homedir(), "Downloads", filename);
  await writeFile(downloadsPath, buf);

  console.log(`\n✅ Done! ${totalRecords} total records → ${filePath}`);
  console.log(`   Also in → ${downloadsPath}`);

  await client.close();
}

main().catch(err => { console.error("Export failed:", err); process.exit(1); });
