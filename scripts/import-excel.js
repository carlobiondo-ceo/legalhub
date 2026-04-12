/**
 * Import script for Legal Cases Tracker.xlsx
 * Run inside the API container: node /app/scripts/import-excel.js
 */
const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

// User IDs - will be looked up dynamically
let USERS = {};

function parseDate(val) {
  if (!val || typeof val === "number" && val < 100) return null;
  if (typeof val === "number") {
    // Excel serial date
    const d = new Date((val - 25569) * 86400000);
    return isNaN(d.getTime()) ? null : d;
  }
  const s = String(val).trim();
  if (!s || s === " ") return null;
  // Try DD.MM.YYYY (German format)
  const deMatch = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (deMatch) {
    return new Date(`${deMatch[3]}-${deMatch[2].padStart(2, "0")}-${deMatch[1].padStart(2, "0")}`);
  }
  // Try YYYY (just a year)
  if (/^\d{4}$/.test(s)) {
    return new Date(`${s}-01-01`);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function mapCategory(cat) {
  if (!cat) return "other";
  const lower = cat.toLowerCase();
  if (lower.includes("cease") || lower.includes("ue")) return "cease_and_desist";
  if (lower.includes("gdpr") || lower.includes("dsgvo") || lower.includes("datenauskunft")) return "gdpr_request";
  if (lower.includes("erasure") || lower.includes("lösch")) return "data_erasure_request";
  if (lower.includes("lawyer") || lower.includes("anwalt")) return "litigation_threat";
  if (lower.includes("court") || lower.includes("gericht") || lower.includes("authority")) return "regulatory_inquiry";
  if (lower.includes("spam") || lower.includes("blacklist")) return "spam_complaint";
  if (lower.includes("complaint")) return "spam_complaint";
  return "other";
}

function mapStatus(status, payment) {
  if (!status) return "new";
  const lower = status.toLowerCase();
  if (lower.includes("completed") || lower.includes("done") || lower.includes("closed") || lower.includes("resolved")) return "resolved_no_action";
  if (lower.includes("settle") || lower.includes("paid")) return "resolved_settlement";
  if (lower.includes("ongoing")) return "in_review";
  if (lower.includes("opt-in") || lower.includes("opt in")) return "opt_in_requested";
  if (lower.includes("lawyer") || lower.includes("stolzen")) return "with_lawyer";
  if (lower.includes("sent") && lower.includes("response")) return "response_sent";
  if (lower.includes("blacklist") || lower.includes("put in")) return "resolved_no_action";
  if (lower.includes("waiting") || lower.includes("pending")) return "awaiting_reply";
  return "in_review";
}

function mapNextActionOwner(who) {
  if (!who) return null;
  const lower = who.toLowerCase();
  if (lower.includes("stolzen")) return null; // External, not a user
  if (lower.includes("nobody") || lower.includes("none")) return null;
  if (lower.includes("hue")) return USERS["Hue Nguyen"];
  if (lower.includes("carlo")) return USERS["Carlo Biondo"];
  if (lower.includes("ninh")) return USERS["Ninh"];
  return null;
}

async function importLegalCases(wb) {
  const ws = wb.Sheets["2025 + 2026 - legal cases"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // Row 0 is a summary row, Row 1 is headers, data starts at Row 2
  const headers = data[1];

  let imported = 0;
  let skipped = 0;

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !String(row[0]).trim()) continue;

    const complainer = String(row[0]).trim();
    const publisher = row[1] ? String(row[1]).trim() : null;
    const jiraLink = row[2] ? String(row[2]).trim() : null;
    const category = row[3] ? String(row[3]).trim() : null;
    const imprint = row[4] ? String(row[4]).trim() : null;
    const geo = row[5] ? String(row[5]).trim() : null;
    const receivedBy = row[6] ? String(row[6]).trim() : null;
    const dateReceived = parseDate(row[7]);
    const deadline = parseDate(row[8]);
    const emailSubject = row[9] ? String(row[9]).trim().replace(/\r/g, "") : null;
    const involveCourt = row[10] ? String(row[10]).trim().toUpperCase() === "YES" : false;
    const involveLawyer = row[11] ? String(row[11]).trim().toUpperCase() === "YES" : false;
    const driveLink = row[12] ? String(row[12]).trim() : null;
    const statusText = row[13] ? String(row[13]).trim() : null;
    const requestedPayment = row[14] ? parseFloat(String(row[14]).replace(/[^\d.,]/g, "").replace(",", ".")) : null;
    const paymentRequestDate = parseDate(row[15]);
    const paymentDeadline = parseDate(row[16]);
    const claimFromPublisher = row[17] ? String(row[17]).trim() : null;
    const originalEmail = row[18] ? String(row[18]).trim() : null;
    const latestAction = row[19] ? String(row[19]).trim() : null;
    const responsibleNext = row[20] ? String(row[20]).trim() : null;
    const paymentRecipient = row[21] ? String(row[21]).trim() : null;
    const needToPay = row[22] ? String(row[22]).trim() : null;
    const invoiceNumber = row[23] ? String(row[23]).trim() : null;
    const paidAmount = row[24] ? parseFloat(String(row[24]).replace(/[^\d.,]/g, "").replace(",", ".")) : null;
    const paidDate = parseDate(row[25]);
    const carloComment = row[26] ? String(row[26]).trim() : null;

    // Build title from complainer + subject
    const title = emailSubject || `Complaint from ${complainer}`;

    // Build internal notes with all the extra data
    const notesParts = [];
    if (publisher) notesParts.push(`Publisher/Supplier: ${publisher}`);
    if (imprint) notesParts.push(`Imprint: ${imprint}`);
    if (receivedBy) notesParts.push(`Received by: ${receivedBy}`);
    if (jiraLink) notesParts.push(`Jira: ${jiraLink}`);
    if (driveLink) notesParts.push(`Drive: ${driveLink}`);
    if (originalEmail) notesParts.push(`Original email: ${originalEmail}`);
    if (latestAction) notesParts.push(`Latest action: ${latestAction}`);
    if (claimFromPublisher) notesParts.push(`Claim from publisher: ${claimFromPublisher}`);
    if (requestedPayment) notesParts.push(`Requested payment: €${requestedPayment}`);
    if (paymentRecipient) notesParts.push(`Payment recipient: ${paymentRecipient}`);
    if (needToPay) notesParts.push(`Need to pay: ${needToPay}`);
    if (invoiceNumber) notesParts.push(`Invoice: ${invoiceNumber}`);
    if (paidAmount) notesParts.push(`Paid amount: €${paidAmount}`);
    if (paidDate) notesParts.push(`Paid date: ${paidDate.toISOString().split("T")[0]}`);
    if (carloComment) notesParts.push(`Carlo's comment: ${carloComment}`);

    // Determine case type from category
    const caseType = mapCategory(category);
    const status = mapStatus(statusText, needToPay);

    // Generate case ID
    const year = dateReceived ? dateReceived.getFullYear() : 2025;
    const existing = await prisma.legalCase.findFirst({
      where: { caseId: { startsWith: `LEGAL-${year}-` } },
      orderBy: { caseId: "desc" },
      select: { caseId: true },
    });
    const nextNum = existing
      ? parseInt(existing.caseId.split("-")[2], 10) + 1
      : 1;
    const caseId = `LEGAL-${year}-${String(nextNum).padStart(4, "0")}`;

    // Check for duplicates by complainant email + date
    const dup = await prisma.legalCase.findFirst({
      where: {
        complainantEmail: complainer,
        title: title,
      },
    });
    if (dup) {
      skipped++;
      continue;
    }

    const nextActionOwnerId = mapNextActionOwner(responsibleNext);

    await prisma.legalCase.create({
      data: {
        caseId,
        title,
        complainantEmail: complainer,
        complainantCountry: geo || null,
        dateReceived: dateReceived || new Date("2025-01-01"),
        sourceEmailSubject: emailSubject,
        source: "other",
        sourceOther: category || null,
        caseType: caseType,
        caseTypeOther: caseType === "other" ? category : null,
        jurisdiction: geo === "DE" ? "Germany" : geo || null,
        status,
        responseDeadline: deadline,
        escalatedToLawyer: involveLawyer,
        nextAction: responsibleNext && responsibleNext !== "Nobody"
          ? `${latestAction || statusText || "Pending"}`
          : null,
        nextActionOwnerId: nextActionOwnerId,
        nextActionDeadline: deadline,
      },
    });

    // Log the import as internal notes via activity
    if (notesParts.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: "imported_from_excel",
          actorId: USERS["Carlo Biondo"],
          caseId: (await prisma.legalCase.findUnique({ where: { caseId } })).id,
          details: {
            notes: notesParts.join("\n"),
            category,
            statusText,
          },
        },
      });
    }

    imported++;
  }

  console.log(`Legal cases: ${imported} imported, ${skipped} skipped (duplicates)`);
}

async function importCompletedCases(wb) {
  const ws = wb.Sheets["Case Completed"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = data[0];

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !String(row[0]).trim()) continue;

    const complainer = String(row[0]).trim();
    const publisher = row[1] ? String(row[1]).trim() : null;
    const category = row[3] ? String(row[3]).trim() : null;
    const geo = row[4] ? String(row[4]).trim() : null;
    const imprint = row[5] ? String(row[5]).trim() : null;
    const receivedBy = row[6] ? String(row[6]).trim() : null;
    const dateReceived = parseDate(row[7]);
    const deadline = parseDate(row[8]);
    const emailSubject = row[9] ? String(row[9]).trim().replace(/\r/g, "") : null;
    const statusText = row[13] ? String(row[13]).trim() : null;
    const latestAction = row[19] ? String(row[19]).trim() : null;
    const needToPay = row[21] ? String(row[21]).trim() : null;
    const paidAmount = row[22] ? parseFloat(String(row[22]).replace(/[^\d.,]/g, "").replace(",", ".")) : null;
    const carloComment = row[23] ? String(row[23]).trim() : null;

    const title = emailSubject || `Complaint from ${complainer}`;

    const dup = await prisma.legalCase.findFirst({
      where: { complainantEmail: complainer, title },
    });
    if (dup) { skipped++; continue; }

    const caseType = mapCategory(category);
    const year = dateReceived ? dateReceived.getFullYear() : 2025;
    const existing = await prisma.legalCase.findFirst({
      where: { caseId: { startsWith: `LEGAL-${year}-` } },
      orderBy: { caseId: "desc" },
      select: { caseId: true },
    });
    const nextNum = existing
      ? parseInt(existing.caseId.split("-")[2], 10) + 1
      : 1;
    const caseId = `LEGAL-${year}-${String(nextNum).padStart(4, "0")}`;

    const status = needToPay && needToPay.toLowerCase().includes("dont")
      ? "resolved_no_action"
      : paidAmount > 0
      ? "resolved_settlement"
      : "resolved_no_action";

    await prisma.legalCase.create({
      data: {
        caseId,
        title,
        complainantEmail: complainer,
        complainantCountry: geo || null,
        dateReceived: dateReceived || new Date("2025-01-01"),
        source: "other",
        sourceOther: category || null,
        caseType,
        caseTypeOther: caseType === "other" ? category : null,
        jurisdiction: geo === "DE" ? "Germany" : geo || null,
        status,
        responseDeadline: deadline,
      },
    });

    imported++;
  }

  console.log(`Completed cases: ${imported} imported, ${skipped} skipped`);
}

async function importOptInRequests(wb) {
  const ws = wb.Sheets["2026 - Normal opt-in requests"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !String(row[0]).trim()) continue;

    const email = String(row[0]).trim();
    const publisher = row[1] ? String(row[1]).trim() : null;
    const imprint = row[2] ? String(row[2]).trim() : null;
    const geo = row[3] ? String(row[3]).trim() : null;
    const mailbox = row[4] ? String(row[4]).trim() : null;
    const dateReceived = parseDate(row[5]);
    const deadline = parseDate(row[6]);
    const statusText = row[7] ? String(row[7]).trim() : null;
    const feedback = row[8] ? String(row[8]).trim() : null;

    // Check duplicate
    const dup = await prisma.optInRequest.findFirst({
      where: { emailAddress: email },
    });
    if (dup) { skipped++; continue; }

    // Generate request ID
    const year = dateReceived ? dateReceived.getFullYear() : 2026;
    const existing = await prisma.optInRequest.findFirst({
      where: { requestId: { startsWith: `OPT-${year}-` } },
      orderBy: { requestId: "desc" },
      select: { requestId: true },
    });
    const nextNum = existing
      ? parseInt(existing.requestId.split("-")[2], 10) + 1
      : 1;
    const requestId = `OPT-${year}-${String(nextNum).padStart(4, "0")}`;

    // Map status
    let status = "pending";
    if (statusText) {
      const lower = statusText.toLowerCase();
      if (lower.includes("sent data") || lower.includes("sent opt")) status = "verified";
      if (lower.includes("blacklist") || lower.includes("done")) status = "verified";
      if (lower.includes("no action") || lower.includes("do nothing")) status = "no_action_needed";
      if (lower.includes("not found")) status = "email_not_found";
    }

    const reason = [
      publisher ? `Publisher: ${publisher}` : null,
      imprint ? `Imprint: ${imprint}` : null,
      mailbox ? `Mailbox: ${mailbox}` : null,
    ].filter(Boolean).join(", ");

    await prisma.optInRequest.create({
      data: {
        requestId,
        emailAddress: email,
        complainantCountry: geo || null,
        dateRequested: dateReceived || new Date(),
        responseDeadline: deadline,
        reason: reason || null,
        notes: [statusText, feedback].filter(Boolean).join("\n") || null,
        status,
        requestedById: USERS["Hue Nguyen"],
      },
    });

    imported++;
  }

  console.log(`Opt-in requests: ${imported} imported, ${skipped} skipped`);
}

async function main() {
  // Get user IDs
  const users = await prisma.user.findMany();
  for (const u of users) {
    USERS[u.name] = u.id;
  }
  console.log("Users:", Object.keys(USERS).join(", "));

  const wb = XLSX.readFile("/app/tracker.xlsx");

  await importLegalCases(wb);
  await importCompletedCases(wb);
  await importOptInRequests(wb);

  // Summary
  const totalCases = await prisma.legalCase.count();
  const totalOptIns = await prisma.optInRequest.count();
  console.log(`\nDone. Total in DB: ${totalCases} legal cases, ${totalOptIns} opt-in requests.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
